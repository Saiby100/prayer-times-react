import { createTheme, ThemeMode } from '@rneui/themed';
import { mistyColors, crescentColors } from './colors';
import { type ThemeColors } from './presets';
import components from './components';
import './types';

const createAppTheme = (mode: ThemeMode = 'light', colorOverrides?: ThemeColors) =>
  createTheme({
    mode,
    lightColors: mode === 'light' && colorOverrides ? colorOverrides : mistyColors,
    darkColors: mode === 'dark' && colorOverrides ? colorOverrides : crescentColors,
    components,
  });

export default createAppTheme;
