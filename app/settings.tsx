import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useThemeMode } from '@rneui/themed';
import Constants from 'expo-constants';

import Page from '@/components/Page';
import Card from '@/components/Card';
import SettingsToggleRow from '@/components/SettingsToggleRow';
import SettingsInfoRow from '@/components/SettingsInfoRow';
import BackgroundPickerPopup from '@/components/BackgroundPickerPopup';
import ReminderOffsetPopup from '@/components/ReminderOffsetPopup';
import NotificationTypePicker from '@/components/NotificationTypePicker';
import { setThemeMode, setRemindersEnabled } from '@/stores';
import usePrayerReminders from '@/hooks/notifications/usePrayerReminders';
import useReleaseUpdate, { type ReleaseCheckStatus } from '@/hooks/useReleaseUpdate';
import ConfirmPopup from '@/components/ConfirmPopup';
import useBackgroundImage from '@/hooks/useBackgroundImage';
import { getBackgroundById } from '@/theme/backgrounds';

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
  const { mode, setMode } = useThemeMode();
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
  const { backgroundId, setBackgroundId } = useBackgroundImage();
  const [bgPickerVisible, setBgPickerVisible] = useState(false);
  const [offsetPopupVisible, setOffsetPopupVisible] = useState(false);
  const [typePickerVisible, setTypePickerVisible] = useState(false);

  const backgroundLabel = getBackgroundById(backgroundId)?.label ?? 'None';

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    setThemeMode(newMode);
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
        <Card title="Appearance">
          <SettingsToggleRow
            label="Theme"
            iconName={mode === 'light' ? 'moon' : 'sun'}
            title={mode === 'light' ? ' Dark mode' : ' Light mode'}
            onPress={toggleTheme}
          />
          <View style={styles.extraRow}>
            <SettingsToggleRow
              label="Background"
              iconName="image"
              title={` ${backgroundLabel}`}
              onPress={() => setBgPickerVisible(true)}
            />
          </View>
        </Card>

        <Card title="Notifications">
          <SettingsToggleRow
            label="Prayer reminders (Beta)"
            iconName={isScheduled ? 'bell' : 'bell-off'}
            title={isScheduled ? ' On' : ' Off'}
            onPress={toggleReminders}
          />
          {isScheduled && (
            <>
              <View style={styles.extraRow}>
                <SettingsToggleRow
                  label="Reminder time"
                  iconName="clock"
                  title={` ${reminderOffset} min before`}
                  onPress={() => setOffsetPopupVisible(true)}
                />
              </View>
              <View style={styles.extraRow}>
                <SettingsToggleRow
                  label="Notification type"
                  iconName={notificationType === 'alarm' ? 'alert-circle' : 'bell'}
                  title={` ${NOTIFICATION_TYPE_LABEL[notificationType]}`}
                  onPress={() => setTypePickerVisible(true)}
                />
              </View>
            </>
          )}
          <Text style={styles.hint}>
            {isScheduled
              ? `Reminders are sent ${reminderOffset} minutes before each prayer time`
              : 'Enable reminders to get notified before each prayer time'}
          </Text>
        </Card>

        <Card title="About">
          <View style={styles.aboutRows}>
            <SettingsInfoRow label="Version" value={Constants.expoConfig?.version ?? '-'} />
          </View>
          <View style={styles.extraRow}>
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
          </View>
        </Card>
      </ScrollView>
      <BackgroundPickerPopup
        visible={bgPickerVisible}
        onClose={() => setBgPickerVisible(false)}
        selectedId={backgroundId}
        onSelect={setBackgroundId}
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
  extraRow: {
    marginTop: 16,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 16,
  },
  aboutRows: {
    gap: 12,
  },
});
