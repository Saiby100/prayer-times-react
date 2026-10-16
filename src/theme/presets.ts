import { ImageSourcePropType } from 'react-native';
import { ThemeMode } from '@rneui/themed';
import { mistyColors, sunsetColors, crescentColors, twilightColors } from './colors';

export type ThemePresetId = 'misty-valley' | 'sunset-medina' | 'crescent-lagoon' | 'twilight-terrace';

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

export const DEFAULT_PRESET_ID: ThemePresetId = 'misty-valley';

export const themePresets: ThemePreset[] = [
  {
    id: 'misty-valley',
    label: 'Misty Valley',
    mode: 'light',
    colors: mistyColors,
    wallpaperSource: require('../../assets/images/backgrounds/misty-valley.png'),
    previewSource: require('../../assets/images/previews/misty-valley.jpg'),
  },
  {
    id: 'sunset-medina',
    label: 'Sunset Medina',
    mode: 'light',
    colors: sunsetColors,
    wallpaperSource: require('../../assets/images/backgrounds/sunset-medina.png'),
    previewSource: require('../../assets/images/previews/sunset-medina.jpg'),
  },
  {
    id: 'crescent-lagoon',
    label: 'Crescent Lagoon',
    mode: 'dark',
    colors: crescentColors,
    wallpaperSource: require('../../assets/images/backgrounds/crescent-lagoon.png'),
    previewSource: require('../../assets/images/previews/crescent-lagoon.jpg'),
  },
  {
    id: 'twilight-terrace',
    label: 'Twilight Terrace',
    mode: 'dark',
    colors: twilightColors,
    wallpaperSource: require('../../assets/images/backgrounds/twilight-terrace.png'),
    previewSource: require('../../assets/images/previews/twilight-terrace.jpg'),
  },
];

export function getPresetById(id: string): ThemePreset | undefined {
  return themePresets.find((preset) => preset.id === id);
}
