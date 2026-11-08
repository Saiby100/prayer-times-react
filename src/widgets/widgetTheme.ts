import {
  DEFAULT_PRESET_ID,
  getPresetById,
  type ThemeColors,
  type ThemePresetId,
} from '@/theme/presets';

/** Palettes a widget is drawn in; Android shows `dark` when the phone is in dark mode. */
export type WidgetThemes = {
  /** Palette drawn in light mode, or in both modes when `dark` is null. */
  light: ThemeColors;
  /** Palette drawn in dark mode, or null to use `light` in both. */
  dark: ThemeColors | null;
};

/** Theme the app uses in dark mode when no theme is picked (matches `getThemeId`). */
const SYSTEM_DARK_PRESET_ID: ThemePresetId = 'crescent-lagoon';

function colorsOf(id: ThemePresetId): ThemeColors {
  return (getPresetById(id) ?? getPresetById(DEFAULT_PRESET_ID)!).colors;
}

/**
 * The picked theme in both modes; with none picked, the app's light and dark defaults, so the
 * widget follows the phone's light/dark switch without a redraw.
 */
export function getWidgetThemes(pickedId: ThemePresetId | null): WidgetThemes {
  if (pickedId) return { light: colorsOf(pickedId), dark: null };
  return { light: colorsOf(DEFAULT_PRESET_ID), dark: colorsOf(SYSTEM_DARK_PRESET_ID) };
}
