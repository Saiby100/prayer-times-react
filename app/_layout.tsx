import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useTheme as useNavTheme } from '@react-navigation/native';
import { ThemeProvider, useTheme } from '@rneui/themed';
import * as SystemUI from 'expo-system-ui';
import * as Notifications from 'expo-notifications';
import createAppTheme from '@/theme';
import { getThemeId } from '@/stores';
import { getPresetById } from '@/theme/presets';

const savedPreset = getPresetById(getThemeId());
const savedMode = savedPreset?.mode ?? 'light';
const savedColors = savedPreset?.colors;

function InnerLayout() {
  const { theme } = useTheme();
  const { colors } = useNavTheme();

  // Override React Navigation's card background to match app theme,
  // preventing white flash during screen transitions
  colors.background = theme.colors.background;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, [theme.colors.background]);

  useEffect(() => {
    const expoSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const { actionIdentifier, notification } = response;
      if (actionIdentifier === 'dismiss') {
        Notifications.dismissNotificationAsync(notification.request.identifier);
      }
    });
    return () => {
      expoSub.remove();
    };
  }, []);

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
    <ThemeProvider theme={createAppTheme(savedMode, savedColors)}>
      <InnerLayout />
    </ThemeProvider>
  );
}
