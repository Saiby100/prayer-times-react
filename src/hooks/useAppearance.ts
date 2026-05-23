import { useCallback, useSyncExternalStore } from 'react';
import { ImageSourcePropType } from 'react-native';
import { ThemeMode } from '@rneui/themed';
import {
  subscribeAppearance,
  getThemeId,
  setThemeId,
  getWallpaperEnabled,
  setWallpaperEnabled,
} from '@/stores';
import { getPresetById, type ThemePresetId } from '@/theme/presets';

type UseAppearance = {
  /** Currently selected theme preset ID. */
  themeId: ThemePresetId;
  /** Update the selected theme preset. */
  setThemeId: (id: ThemePresetId) => void;
  /** Whether the wallpaper is currently enabled. */
  wallpaperEnabled: boolean;
  /** Toggle wallpaper on or off. */
  setWallpaperEnabled: (enabled: boolean) => void;
  /** Resolved wallpaper image source, or null when wallpaper is disabled. */
  wallpaperSource: ImageSourcePropType | null;
  /** The theme mode derived from the current preset. */
  themeMode: ThemeMode;
};

export default function useAppearance(): UseAppearance {
  const themeId = useSyncExternalStore(subscribeAppearance, getThemeId);
  const wallpaperEnabled = useSyncExternalStore(subscribeAppearance, getWallpaperEnabled);

  const updateThemeId = useCallback((id: ThemePresetId) => {
    setThemeId(id);
  }, []);

  const updateWallpaperEnabled = useCallback((enabled: boolean) => {
    setWallpaperEnabled(enabled);
  }, []);

  const preset = getPresetById(themeId);
  const wallpaperSource = wallpaperEnabled ? (preset?.wallpaperSource ?? null) : null;
  const themeMode: ThemeMode = preset?.mode ?? 'light';

  return {
    themeId,
    setThemeId: updateThemeId,
    wallpaperEnabled,
    setWallpaperEnabled: updateWallpaperEnabled,
    wallpaperSource,
    themeMode,
  };
}
