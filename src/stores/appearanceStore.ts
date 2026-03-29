import getStorage from '@/utils/localStore';

type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'themeMode';
const BACKGROUND_KEY = 'backgroundImage';

// --- Theme ---

export function getThemeMode(): ThemeMode {
  return (getStorage().getString(THEME_KEY) as ThemeMode) || 'light';
}

export function setThemeMode(mode: ThemeMode): void {
  getStorage().set(THEME_KEY, mode);
}

// --- Background image ---

let listeners: (() => void)[] = [];

export function subscribeBackground(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getBackgroundId(): string {
  return getStorage().getString(BACKGROUND_KEY) ?? 'none';
}

export function setBackgroundId(id: string): void {
  getStorage().set(BACKGROUND_KEY, id);
  for (const listener of listeners) {
    listener();
  }
}
