export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'genomni_theme_mode';

export function readThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const value = window.localStorage.getItem(THEME_KEY);
  return value === 'dark' ? 'dark' : 'light';
}

export function applyThemeMode(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', mode);
}

export function saveThemeMode(mode: ThemeMode) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(THEME_KEY, mode);
}

