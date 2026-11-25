const THEME_KEY = "theme";
const KEY = 'theme';

export function load(): string | null {
  return localStorage.getItem("theme");
}

export function save(value: string): void {
  localStorage.setItem("theme", value);
}
