import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useTheme as useNavTheme } from '@react-navigation/native';
import { ThemeProvider, useTheme } from '@rneui/themed';
import * as SystemUI from 'expo-system-ui';
import createAppTheme from '@/theme';
import { getThemeId, getDismissedReleaseVersion } from '@/stores';
import { getPresetById } from '@/theme/presets';
import useReleaseUpdate from '@/hooks/useReleaseUpdate';
import ConfirmPopup from '@/components/ConfirmPopup';

const savedPreset = getPresetById(getThemeId());
const savedMode = savedPreset?.mode ?? 'light';
const savedColors = savedPreset?.colors;

function InnerLayout() {
  const { theme } = useTheme();
  const { colors } = useNavTheme();
  const { updateAvailable, latestVersion, downloadUpdate, dismiss } = useReleaseUpdate({
    autoCheck: true,
  });
  const isDismissed = latestVersion ? getDismissedReleaseVersion() === latestVersion : false;
  const [popupDismissed, setPopupDismissed] = useState(false);

  // Override React Navigation's card background to match app theme,
  // preventing white flash during screen transitions
  colors.background = theme.colors.background;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, [theme.colors.background]);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          navigationBarColor: theme.colors.background,
          presentation: 'transparentModal',
        }}
      />
      <ConfirmPopup
        visible={updateAvailable && !!latestVersion && !isDismissed && !popupDismissed}
        title="Update Available"
        message={`A new version (v${latestVersion}) is available.`}
        confirmLabel="Download"
        dismissLabel="Remind Me Later"
        onConfirm={downloadUpdate}
        onDismiss={() => {
          dismiss();
          setPopupDismissed(true);
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider theme={createAppTheme(savedMode, savedColors)}>
      <InnerLayout />
    </ThemeProvider>
  );
}
