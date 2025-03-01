import { Stack } from 'expo-router';
import { createTheme, ThemeProvider } from '@rneui/themed';

declare module '@rneui/themed' {
  export interface Colors {
    text: string;
    bgLight: string;
  }
}

export default function RootLayout() {
  const themeConfig = createTheme({
    lightColors: {
      primary: '#2089DC',
      secondary: '#2089DC',
      text: '#000000',
      bgLight: '#ffffff',
      background: '#ffffff',
    },
    darkColors: {
      primary: '#6E61FF',
      secondary: '#6E61FF',
      text: '#ffffff',
      bgLight: '#303446',
      background: '#232634',
    },
  });

  return (
    <ThemeProvider theme={themeConfig}>
      <Stack />
    </ThemeProvider>
  );
}
