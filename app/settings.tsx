import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme, useThemeMode } from '@rneui/themed';
import Constants from 'expo-constants';

import Page from '@/components/Page';
import Card from '@/components/Card';
import SettingsToggleRow from '@/components/SettingsToggleRow';
import SettingsInfoRow from '@/components/SettingsInfoRow';
import ThemePickerPopup from '@/components/ThemePickerPopup';
import ReminderOffsetPopup from '@/components/ReminderOffsetPopup';
import NotificationTypePicker from '@/components/NotificationTypePicker';
import { setRemindersEnabled } from '@/stores';
import usePrayerReminders from '@/hooks/notifications/usePrayerReminders';
import useDisabledPrayers from '@/hooks/notifications/useDisabledPrayers';
import useReleaseUpdate, { type ReleaseCheckStatus } from '@/hooks/useReleaseUpdate';
import ConfirmPopup from '@/components/ConfirmPopup';
import useAppearance from '@/hooks/useAppearance';
import { getPresetById, type ThemePresetId } from '@/theme/presets';

const NOTIFICATION_TYPE_LABEL: Record<string, string> = {
  notification: 'Notification',
  alarm: 'Alarm',
};

const updateIconName: Record<ReleaseCheckStatus, string> = {
  idle: 'download',
  checking: 'download',
  'up-to-date': 'check-circle',
  'update-available': 'arrow-up-circle',
  error: 'alert-circle',
};

const updateTitle: Record<ReleaseCheckStatus, string> = {
  idle: ' Check for updates',
  checking: ' Checking...',
  'up-to-date': ' Up to date',
  'update-available': ' Update available',
  error: ' Check failed',
};

export default function Settings() {
  const { updateTheme } = useTheme();
  const { setMode } = useThemeMode();
  const {
    isScheduled,
    schedule,
    clear,
    reminderOffset,
    setReminderOffset,
    notificationType,
    setNotificationType,
  } = usePrayerReminders();
  const { latestVersion, checkStatus, loading, checkForUpdate, downloadUpdate } =
    useReleaseUpdate();
  const [updatePopupVisible, setUpdatePopupVisible] = useState(false);
  const { themeId, setThemeId, wallpaperEnabled, setWallpaperEnabled } = useAppearance();
  const { disabledPrayers, resetAll } = useDisabledPrayers();
  const [themePickerVisible, setThemePickerVisible] = useState(false);
  const [resetPopupVisible, setResetPopupVisible] = useState(false);
  const [offsetPopupVisible, setOffsetPopupVisible] = useState(false);
  const [typePickerVisible, setTypePickerVisible] = useState(false);

  const themeLabel = getPresetById(themeId)?.label ?? 'Light Mosque';

  const handleThemeSelect = (id: ThemePresetId) => {
    setThemeId(id);
    const preset = getPresetById(id);
    if (!preset) return;
    setMode(preset.mode);
    const colorKey = preset.mode === 'light' ? 'lightColors' : 'darkColors';
    updateTheme({ [colorKey]: preset.colors });
  };

  const toggleReminders = () => {
    if (isScheduled) {
      setRemindersEnabled(false);
      clear();
      return;
    }
    setRemindersEnabled(true);
    schedule();
  };

  return (
    <Page
      name="settings"
      title="Settings"
      options={{
        headerBackVisible: true,
      }}
      contentStyle={styles.content}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Card title="Appearance" gap={16}>
          <SettingsToggleRow
            label="Theme"
            iconName="image"
            title={` ${themeLabel}`}
            onPress={() => setThemePickerVisible(true)}
          />
          <SettingsToggleRow
            label="Wallpaper"
            iconName={wallpaperEnabled ? 'eye' : 'eye-off'}
            title={wallpaperEnabled ? ' On' : ' Off'}
            onPress={() => setWallpaperEnabled(!wallpaperEnabled)}
          />
        </Card>

        <Card title="Notifications" gap={16}>
          <SettingsToggleRow
            label="Prayer reminders"
            iconName={isScheduled ? 'bell' : 'bell-off'}
            title={isScheduled ? ' On' : ' Off'}
            onPress={toggleReminders}
          />
          {isScheduled && (
            <>
              <SettingsToggleRow
                label="Reminder time"
                iconName="clock"
                title={` ${reminderOffset} min before`}
                onPress={() => setOffsetPopupVisible(true)}
              />
              <SettingsToggleRow
                label="Notification type"
                iconName={notificationType === 'alarm' ? 'alert-circle' : 'bell'}
                title={` ${NOTIFICATION_TYPE_LABEL[notificationType]}`}
                onPress={() => setTypePickerVisible(true)}
              />
            </>
          )}
          {!isScheduled && (
            <Text style={styles.hint}>
              Enable reminders to get notified before each prayer time
            </Text>
          )}
        </Card>

        <Card title="Preferences" gap={16}>
          <SettingsToggleRow
            label="Hidden prayers"
            iconName="eye-off"
            title={` ${disabledPrayers.length} hidden`}
            disabled={disabledPrayers.length === 0}
            onPress={() => setResetPopupVisible(true)}
          />
        </Card>

        <Card title="About" gap={16}>
          <SettingsInfoRow label="Version" value={Constants.expoConfig?.version ?? '-'} />
          <SettingsToggleRow
            label="Updates"
            iconName={updateIconName[checkStatus]}
            title={updateTitle[checkStatus]}
            loading={loading}
            disabled={loading}
            onPress={async () => {
              if (checkStatus === 'update-available') {
                setUpdatePopupVisible(true);
              } else {
                const found = await checkForUpdate();
                if (found) setUpdatePopupVisible(true);
              }
            }}
          />
        </Card>
      </ScrollView>
      <ThemePickerPopup
        visible={themePickerVisible}
        onClose={() => setThemePickerVisible(false)}
        selectedId={themeId}
        onSelect={handleThemeSelect}
      />
      <ReminderOffsetPopup
        visible={offsetPopupVisible}
        currentValue={reminderOffset}
        onSave={setReminderOffset}
        onClose={() => setOffsetPopupVisible(false)}
      />
      <NotificationTypePicker
        visible={typePickerVisible}
        currentType={notificationType}
        onSelect={setNotificationType}
        onClose={() => setTypePickerVisible(false)}
      />
      <ConfirmPopup
        visible={resetPopupVisible}
        title="Reset hidden prayers?"
        message="All hidden prayers will be visible on the home screen again."
        confirmLabel="Reset"
        dismissLabel="Cancel"
        onConfirm={() => {
          setResetPopupVisible(false);
          resetAll();
        }}
        onDismiss={() => setResetPopupVisible(false)}
      />
      <ConfirmPopup
        visible={updatePopupVisible}
        title="Update Available"
        message={`Version ${latestVersion} is ready to download.`}
        confirmLabel="Download"
        dismissLabel="Cancel"
        onConfirm={() => {
          setUpdatePopupVisible(false);
          downloadUpdate();
        }}
        onDismiss={() => setUpdatePopupVisible(false)}
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
  hint: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 16,
  },
});
