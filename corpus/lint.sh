#!/usr/bin/env bash
# corpus/lint.sh - mechanical health check for the corpus.
#
#   bash corpus/lint.sh           run all checks; exit non-zero on failure
#   bash corpus/lint.sh --index   regenerate the catalog block in index.md
#
# FAIL checks: wiki frontmatter (summary, updated), body length, relative
# links, orphan wiki pages, the blocked/ rules (every file in a blocked/
# folder has its condition, no file outside has one, no brief number twice
# across the four folders).
set -uo pipefail

CORPUS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$CORPUS/.." && pwd)"
WIKI="$CORPUS/wiki"
INDEX="$CORPUS/index.md"
MAX_BODY_LINES=200

fail=0
problem() { printf 'FAIL  %s\n' "$1"; fail=1; }
rel() { printf '%s' "${1#"$ROOT"/}"; }
summary_of() { head -20 "$1" | sed -n 's/^summary:[[:space:]]*//p' | head -1; }
has_key() { head -20 "$1" | grep -qE "^$2:[[:space:]]*[^[:space:]]"; }
body_line_count() {
  awk 'NR==1 && $0=="---" { fm=1; next }
       fm  && $0=="---"   { fm=0; next }
       !fm                { n++ }
       END                { print n+0 }' "$1"
}

if [[ "${1:-}" == "--index" ]]; then
  grep -q '<!-- BEGIN CATALOG -->' "$INDEX" || { problem "index.md has no BEGIN CATALOG marker"; exit 1; }
  tmp="$(mktemp)"
  awk '/<!-- BEGIN CATALOG -->/ { print; exit } { print }' "$INDEX" >"$tmp"
  {
    echo
    for f in "$WIKI"/*.md; do
      [[ -e "$f" ]] || continue
      b="$(basename "$f")"
      printf -- '- [wiki/%s](wiki/%s) - %s\n' "$b" "$b" "$(summary_of "$f")"
    done
    echo
  } >>"$tmp"
  awk 'f { print } /<!-- END CATALOG -->/ && !f { print; f=1 }' "$INDEX" >>"$tmp"
  mv "$tmp" "$INDEX"
  echo "regenerated catalog in $(rel "$INDEX")"
  exit 0
fi

for f in "$WIKI"/*.md; do
  [[ -e "$f" ]] || continue
  r="$(rel "$f")"
  has_key "$f" summary || problem "$r: missing or empty summary: frontmatter"
  has_key "$f" updated || problem "$r: missing or empty updated: frontmatter"
  n="$(body_line_count "$f")"
  (( n > MAX_BODY_LINES )) && problem "$r: $n body lines exceeds $MAX_BODY_LINES"
done

while IFS= read -r f; do
  d="$(dirname "$f")"
  while IFS= read -r target; do
    case "$target" in ''|http://*|https://*|mailto:*|\#*) continue ;; esac
    target="${target%%#*}"
    [[ -z "$target" || -e "$d/$target" ]] || problem "$(rel "$f"): broken link -> $target"
  done < <(grep -oE '\]\([^) ]+\)' "$f" | sed -E 's/^\]\(//; s/\)$//')
done < <(find "$CORPUS" -name '*.md' -type f | sort)

for f in "$WIKI"/*.md; do
  [[ -e "$f" ]] || continue
  grep -q "wiki/$(basename "$f")" "$INDEX" || problem "wiki/$(basename "$f") is an orphan, not linked from index.md"
done

# blocked/ rules. Only the first 12 lines of a file are looked at, so a
# mention of the line format in prose further down is not mistaken for one.
for f in "$CORPUS"/briefs/blocked/*.md; do
  [[ -e "$f" ]] || continue
  head -12 "$f" | grep -qE '^\*\*Blocked by:\*\*[[:space:]]*[^[:space:]]' \
    || problem "$(rel "$f"): in blocked/ but has no '**Blocked by:** <condition>' line under the H1"
done
for f in "$CORPUS"/todos/blocked/*.md; do
  [[ -e "$f" ]] || continue
  has_key "$f" blocked-by || problem "$(rel "$f"): in blocked/ but has no 'blocked-by:' frontmatter key"
done
for f in "$CORPUS"/briefs/todo/*.md "$CORPUS"/briefs/done/*.md "$CORPUS"/briefs/superseded/*.md; do
  [[ -e "$f" ]] || continue
  head -12 "$f" | grep -qE '^\*\*Blocked by:\*\*' \
    && problem "$(rel "$f"): has a 'Blocked by:' line but is not in briefs/blocked/"
done
for f in "$CORPUS"/todos/*.md; do
  [[ -e "$f" ]] || continue
  has_key "$f" blocked-by && problem "$(rel "$f"): has a 'blocked-by:' key but is not in todos/blocked/"
done
dups="$(ls "$CORPUS"/briefs/{todo,blocked,done,superseded}/ 2>/dev/null \
  | grep -oE '^[0-9]+' | sort | uniq -d)"
for n in $dups; do problem "brief number $n appears more than once across todo/, blocked/, done/, superseded/"; done

echo
if (( fail )); then echo "corpus lint: FAILED"; exit 1; fi
echo "corpus lint: clean"
