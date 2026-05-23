import { createTheme, ThemeMode } from '@rneui/themed';
import { lightColors, darkColors } from './colors';
import { type ThemeColors } from './presets';
import components from './components';
import './types';

const createAppTheme = (mode: ThemeMode = 'light', colorOverrides?: ThemeColors) =>
  createTheme({
    mode,
    lightColors: mode === 'light' && colorOverrides ? colorOverrides : lightColors,
    darkColors: mode === 'dark' && colorOverrides ? colorOverrides : darkColors,
    components,
  });

export default createAppTheme;
