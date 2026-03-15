import { Stack } from 'expo-router';
import { useTheme as useNavTheme } from '@react-navigation/native';
import { ThemeProvider, useTheme, ThemeMode } from '@rneui/themed';
import createAppTheme from '@/theme';
import getStorage from '@/utils/localStore';

const storage = getStorage();
const savedMode = (storage.getString('themeMode') as ThemeMode) || 'light';

if (!storage.getString('themeMode')) storage.set('themeMode', 'light');

function InnerLayout() {
  const { theme } = useTheme();
  const { colors } = useNavTheme();

  // Override React Navigation's card background to match app theme,
  // preventing white flash during screen transitions
  colors.background = theme.colors.background;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        navigationBarColor: theme.colors.background,
        presentation: 'transparentModal',
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider theme={createAppTheme(savedMode)}>
      <InnerLayout />
    </ThemeProvider>
  );
}
