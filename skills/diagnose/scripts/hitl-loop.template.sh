#!/usr/bin/env bash
# hitl-loop.template.sh - a feedback loop for a bug only a person can see.
# Copy it into the scratch folder, fill in the three variables, and run it.
# Each run starts the thing under test, asks one question, and exits 0 when
# the person says the symptom is gone, 1 when it is still there.
set -u

# 1. The command that brings the thing under test to the state to look at.
RUN_CMD='echo "replace me: start the app, open the page, print the value"'
# 2. What the person should look at, in one line.
LOOK_AT='replace me: the second row of the table'
# 3. The question, answerable with y or n. "y" means the BUG IS PRESENT.
QUESTION='Do you still see the wrong value?'

if [ "${1:-}" = "--self-test" ]; then
  echo "template ok"; exit 0
fi

bash -c "$RUN_CMD" || { echo "the run itself failed" >&2; exit 2; }
echo "Look at: $LOOK_AT"
read -r -p "$QUESTION [y/n] " answer
case "$answer" in
  y|Y) echo "RED: the bug is present"; exit 1 ;;
  n|N) echo "GREEN: the bug is gone"; exit 0 ;;
  *)   echo "answer y or n" >&2; exit 2 ;;
esac
