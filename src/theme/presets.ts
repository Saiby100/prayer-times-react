import { ImageSourcePropType } from 'react-native';
import { ThemeMode } from '@rneui/themed';
import { lightColors, darkColors, warmDarkColors } from './colors';

export type ThemePresetId = 'light-mosque' | 'dark-mosque' | 'serene-night';

export type ThemeColors = {
  /** Primary accent color used for highlights and interactive elements. */
  primary: string;
  /** Secondary accent color used for skeleton loaders and decorative elements. */
  secondary: string;
  /** Primary text color. */
  text: string;
  /** Card and input background color. */
  bgLight: string;
  /** Main screen background color. */
  background: string;
  /** Slider track, divider, and border color. */
  sliderTrack: string;
};

export type ThemePreset = {
  /** Unique identifier for the theme preset. */
  id: ThemePresetId;
  /** Display label shown in the theme picker. */
  label: string;
  /** The @rneui/themed color mode this preset uses. */
  mode: ThemeMode;
  /** Color palette for this preset. */
  colors: ThemeColors;
  /** Image source for the wallpaper associated with this preset. */
  wallpaperSource: ImageSourcePropType;
  /** Preview image source shown in the theme picker popup. */
  previewSource: ImageSourcePropType;
};

export const DEFAULT_PRESET_ID: ThemePresetId = 'light-mosque';

export const themePresets: ThemePreset[] = [
  {
    id: 'light-mosque',
    label: 'Light Mosque',
    mode: 'light',
    colors: lightColors,
    wallpaperSource: require('../../assets/images/backgrounds/light-mosque.png'),
    previewSource: require('../../assets/images/backgrounds/light-mosque.png'),
  },
  {
    id: 'dark-mosque',
    label: 'Dark Mosque',
    mode: 'dark',
    colors: darkColors,
    wallpaperSource: require('../../assets/images/backgrounds/dark-mosque.png'),
    previewSource: require('../../assets/images/backgrounds/dark-mosque.png'),
  },
  {
    id: 'serene-night',
    label: 'Serene Night',
    mode: 'dark',
    colors: warmDarkColors,
    wallpaperSource: require('../../assets/images/backgrounds/serene-night.png'),
    previewSource: require('../../assets/images/backgrounds/serene-night.png'),
  },
];

export function getPresetById(id: string): ThemePreset | undefined {
  return themePresets.find((preset) => preset.id === id);
}
