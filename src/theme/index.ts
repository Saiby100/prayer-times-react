import { createTheme, ThemeMode } from '@rneui/themed';
import { lightColors, darkColors } from './colors';
import components from './components';
import './types';

const createAppTheme = (mode: ThemeMode = 'light') =>
  createTheme({
    mode,
    lightColors,
    darkColors,
    components,
  });

export default createAppTheme;
