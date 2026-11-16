import { useSyncExternalStore } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'finora_theme';
const listeners = new Set<() => void>();

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;
}

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    /* storage can be blocked; fall back to the system preference */
  }
  return 'system';
}

let mode: ThemeMode = readStoredMode();

export function resolveTheme(next: ThemeMode = mode): ResolvedTheme {
  if (next === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return next;
}

function applyTheme() {
  if (typeof document === 'undefined') return;
  const resolved = resolveTheme();
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
  const meta = document.querySelector<HTMLMetaElement>('#theme-color-meta');
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0E0F15' : '#6655D9');
}

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setThemeMode(next: ThemeMode) {
  mode = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore quota / privacy mode errors */
  }
  applyTheme();
  notify();
}

if (typeof window !== 'undefined') {
  applyTheme();
  // Follow the OS while the user keeps the "system" option selected.
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener?.('change', () => {
      if (mode === 'system') {
        applyTheme();
        notify();
      }
    });
}

/** Reads and updates the app theme; shared across every component. */
export function useTheme() {
  const currentMode = useSyncExternalStore(
    subscribe,
    () => mode,
    () => 'system' as ThemeMode,
  );
  return {
    mode: currentMode,
    resolved: resolveTheme(currentMode),
    setMode: setThemeMode,
    toggle: () => setThemeMode(resolveTheme(currentMode) === 'dark' ? 'light' : 'dark'),
  };
}
