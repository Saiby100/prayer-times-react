import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';

import Page from '@/components/Page';
import Card from '@/components/Card';
import SettingsSwitchRow from '@/components/SettingsSwitchRow';
import SettingsToggleRow from '@/components/SettingsToggleRow';
import ThemePickerPopup from '@/components/ThemePickerPopup';
import useAppearance from '@/hooks/useAppearance';
import { DEFAULT_PRESET_ID, getPresetById, type ThemePresetId } from '@/theme/presets';

export default function AppearanceSettings() {
  const { updateTheme } = useTheme();
  const { setMode } = useThemeMode();
  const { themeId, setThemeId, wallpaperEnabled, setWallpaperEnabled } = useAppearance();
  const [themePickerVisible, setThemePickerVisible] = useState(false);

  const themeLabel = (getPresetById(themeId) ?? getPresetById(DEFAULT_PRESET_ID))?.label;

  const handleThemeSelect = (id: ThemePresetId) => {
    setThemeId(id);
    const preset = getPresetById(id);
    if (!preset) return;
    setMode(preset.mode);
    const colorKey = preset.mode === 'light' ? 'lightColors' : 'darkColors';
    updateTheme({ [colorKey]: preset.colors });
  };

  return (
    <Page title="Appearance" options={{ headerBackVisible: true }} contentStyle={styles.content}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card gap={16}>
          <SettingsToggleRow
            label="Theme"
            iconName="image"
            title={` ${themeLabel}`}
            onPress={() => setThemePickerVisible(true)}
          />
          <SettingsSwitchRow
            label="Wallpaper"
            value={wallpaperEnabled}
            onValueChange={setWallpaperEnabled}
          />
        </Card>
      </ScrollView>
      <ThemePickerPopup
        visible={themePickerVisible}
        onClose={() => setThemePickerVisible(false)}
        selectedId={themeId}
        onSelect={handleThemeSelect}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  container: {
    paddingHorizontal: 24,
    gap: 16,
  },
});
