import getStorage from '@/utils/localStore';
import { type ThemePresetId, DEFAULT_PRESET_ID } from '@/theme/presets';

const THEME_ID_KEY = 'themeId';
const WALLPAPER_ENABLED_KEY = 'wallpaperEnabled';

// Legacy keys for one-time migration
const LEGACY_THEME_MODE_KEY = 'themeMode';
const LEGACY_BACKGROUND_KEY = 'backgroundImage';

let migrated = false;

function migrateLegacyKeys(): void {
  if (migrated) return;
  migrated = true;

  const storage = getStorage();
  const hasNewKey = storage.contains(THEME_ID_KEY);
  if (hasNewKey) return;

  const legacyMode = storage.getString(LEGACY_THEME_MODE_KEY);
  const legacyBg = storage.getString(LEGACY_BACKGROUND_KEY);

  if (legacyMode || legacyBg) {
    const themeId: ThemePresetId = legacyMode === 'dark' ? 'dark-mosque' : 'light-mosque';
    const wallpaperEnabled = legacyBg !== 'none';

    storage.set(THEME_ID_KEY, themeId);
    storage.set(WALLPAPER_ENABLED_KEY, wallpaperEnabled ? 'true' : 'false');
    storage.delete(LEGACY_THEME_MODE_KEY);
    storage.delete(LEGACY_BACKGROUND_KEY);
  }
}

// --- Pub-sub ---

let listeners: (() => void)[] = [];

export function subscribeAppearance(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

// --- Theme preset ---

export function getThemeId(): ThemePresetId {
  migrateLegacyKeys();
  return (getStorage().getString(THEME_ID_KEY) as ThemePresetId) || DEFAULT_PRESET_ID;
}

export function setThemeId(id: ThemePresetId): void {
  getStorage().set(THEME_ID_KEY, id);
  notifyListeners();
}

// --- Wallpaper toggle ---

export function getWallpaperEnabled(): boolean {
  migrateLegacyKeys();
  const value = getStorage().getString(WALLPAPER_ENABLED_KEY);
  return value !== 'false';
}

export function setWallpaperEnabled(enabled: boolean): void {
  getStorage().set(WALLPAPER_ENABLED_KEY, enabled ? 'true' : 'false');
  notifyListeners();
}
