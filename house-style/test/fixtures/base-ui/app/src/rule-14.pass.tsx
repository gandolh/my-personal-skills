// A bare key in a comment: localStorage.getItem("theme") is not a call.
const KEY = "lantern.theme";
const LEGACY_THEME_KEY = "theme";

function readLegacyTheme(): string | null {
  return localStorage.getItem("theme");
}

export function load(): string | null {
  return localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_THEME_KEY) ?? readLegacyTheme();
}

export function save(value: string): void {
  localStorage.setItem(KEY, value);
  localStorage.setItem("lantern.theme", value);
}
