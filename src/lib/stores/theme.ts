import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const STORAGE_KEY = 'memlyra-theme';

export type ThemeMode = 'light' | 'dark';

export const theme = writable<ThemeMode>('dark');

function readStoredTheme(): ThemeMode {
  if (!browser) return 'dark';

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

function applyTheme(mode: ThemeMode) {
  if (!browser) return;
  document.documentElement.dataset.theme = mode;
  localStorage.setItem(STORAGE_KEY, mode);
}

export function initTheme() {
  if (!browser) return;
  const mode = readStoredTheme();
  applyTheme(mode);
  theme.set(mode);
}

export function setTheme(mode: ThemeMode) {
  applyTheme(mode);
  theme.set(mode);
}

export function toggleTheme() {
  theme.update((current) => {
    const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    return next;
  });
}
