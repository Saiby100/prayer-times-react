import { Stack } from 'expo-router';
import { ThemeProvider, useTheme } from '@rneui/themed';
import theme from '@/theme';

function InnerLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider theme={theme}>
      <InnerLayout />
    </ThemeProvider>
  );
}