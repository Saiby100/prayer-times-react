import { createTheme } from '@rneui/themed';
import { lightColors, darkColors } from './colors';
import components from './components';
import './types';

const theme = createTheme({
  lightColors,
  darkColors,
  components,
});

export default theme;