import { browser } from '$app/environment';
import { writable } from 'svelte/store';

import { SESSION_STORAGE_KEYS } from '$lib/app';

const STORAGE_KEY = SESSION_STORAGE_KEYS.theme;

export type ThemeMode = 'light' | 'dark';

export const theme = writable<ThemeMode>('light');

function readStoredTheme(): ThemeMode {
  if (!browser) return 'light';

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'light';
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
