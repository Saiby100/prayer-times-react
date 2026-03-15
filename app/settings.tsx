import { StyleSheet, View } from 'react-native';
import { Text, useThemeMode } from '@rneui/themed';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

import Page from '@/components/Page';
import Card from '@/components/Card';
import SettingsToggleRow from '@/components/SettingsToggleRow';
import SettingsInfoRow from '@/components/SettingsInfoRow';
import getStorage from '@/utils/localStore';
import usePrayerReminders from '@/hooks/notifications/usePrayerReminders';
import useUpdates, { type UpdateStatus } from '@/hooks/useUpdates';

const REMINDER_HINT = 'Reminders are sent 5 minutes before each prayer time';

const updateIconName: Record<UpdateStatus, string> = {
  idle: 'download',
  checking: 'download',
  downloading: 'download',
  'up-to-date': 'check-circle',
  error: 'alert-circle',
};

const updateTitle: Record<UpdateStatus, string> = {
  idle: ' Check for updates',
  checking: ' Checking...',
  downloading: ' Downloading...',
  'up-to-date': ' Up to date',
  error: ' Update failed',
};

export default function Settings() {
  const { mode, setMode } = useThemeMode();
  const storage = getStorage();
  const { isScheduled, schedule, clear } = usePrayerReminders();
  const { updateStatus, checkForUpdates } = useUpdates();

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    storage.set('themeMode', newMode);
  };

  const toggleReminders = () => {
    if (isScheduled) {
      storage.set('remindersEnabled', false);
      clear();
      return;
    }
    storage.set('remindersEnabled', true);
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
      <View style={styles.container}>
        <Card title="Appearance">
          <SettingsToggleRow
            label="Theme"
            iconName={mode === 'light' ? 'moon' : 'sun'}
            title={mode === 'light' ? ' Dark mode' : ' Light mode'}
            onPress={toggleTheme}
          />
        </Card>

        <Card title="Notifications">
          <SettingsToggleRow
            label="Prayer reminders (Beta)"
            iconName={isScheduled ? 'bell' : 'bell-off'}
            title={isScheduled ? ' On' : ' Off'}
            onPress={toggleReminders}
          />
          <Text style={styles.hint}>{REMINDER_HINT}</Text>
        </Card>

        <Card title="About">
          <View style={styles.aboutRows}>
            <SettingsInfoRow label="Version" value={Constants.expoConfig?.version ?? '-'} />
            {Updates.channel ? <SettingsInfoRow label="Channel" value={Updates.channel} /> : null}
            {Constants.expoConfig?.extra?.commitHash ? (
              <SettingsInfoRow
                label="Commit"
                value={Constants.expoConfig.extra.commitHash}
                selectable
              />
            ) : null}
            {Updates.createdAt ? (
              <SettingsInfoRow
                label="Published"
                value={Updates.createdAt.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              />
            ) : null}
          </View>
          {Updates.channel ? (
            <View style={styles.extraRow}>
              <SettingsToggleRow
                label="Updates"
                iconName={updateIconName[updateStatus]}
                title={updateTitle[updateStatus]}
                loading={updateStatus === 'checking' || updateStatus === 'downloading'}
                disabled={updateStatus !== 'idle'}
                onPress={checkForUpdates}
              />
            </View>
          ) : null}
        </Card>
      </View>
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
