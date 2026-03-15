import { StyleSheet, View } from 'react-native';
import { Button, Text, useThemeMode } from '@rneui/themed';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

import Page from '@/components/Page';
import Card from '@/components/Card';
import getStorage from '@/utils/localStore';
import usePTNotification from '@/hooks/usePTNotification';
import useHijriDate from '@/hooks/useHijriDate';
import useUpdates, { type UpdateStatus } from '@/hooks/useUpdates';

export default function Settings() {
  const { mode, setMode } = useThemeMode();
  const storage = getStorage();
  const { clearAllPrayerReminders, initPrayerReminders, notificationsIsScheduled } =
    usePTNotification();
  const { showHijri, toggleShowHijri, hijriSupported } = useHijriDate(new Date());
  const { updateStatus, checkForUpdates } = useUpdates();

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

  return (
    <Page
      name="settings"
      title="Settings"
      options={{
        headerBackVisible: true,
      }}
      contentStyle={{ justifyContent: 'flex-start', paddingTop: 20 }}
    >
      <View style={{ paddingHorizontal: 24, gap: 16 }}>
        <Card title="Appearance">
          <View style={styles.row}>
            <Text style={styles.label}>Theme</Text>
            <Button
              type="outline"
              size="sm"
              radius="md"
              icon={{
                name: mode === 'light' ? 'moon' : 'sun',
                type: 'feather',
                size: 18,
              }}
              title={mode === 'light' ? ' Dark mode' : ' Light mode'}
              titleStyle={{ fontSize: 14 }}
              buttonStyle={{ borderWidth: 1 }}
              onPress={() => {
                if (mode === 'light') {
                  setMode('dark');
                  storage.set('themeMode', 'dark');
                } else {
                  setMode('light');
                  storage.set('themeMode', 'light');
                }
              }}
            />
          </View>
          {hijriSupported && (
            <View style={[styles.row, { marginTop: 16 }]}>
              <Text style={styles.label}>Hijri date</Text>
              <Button
                type="outline"
                size="sm"
                radius="md"
                icon={{
                  name: showHijri ? 'eye' : 'eye-off',
                  type: 'feather',
                  size: 18,
                }}
                title={showHijri ? ' Shown' : ' Hidden'}
                titleStyle={{ fontSize: 14 }}
                buttonStyle={{ borderWidth: 1 }}
                onPress={toggleShowHijri}
              />
            </View>
          )}
        </Card>

        <Card title="Notifications">
          <View style={styles.row}>
            <Text style={styles.label}>Prayer reminders (Beta)</Text>
            <Button
              type="outline"
              size="sm"
              radius="md"
              icon={{
                name: notificationsIsScheduled ? 'bell' : 'bell-off',
                type: 'feather',
                size: 18,
              }}
              title={notificationsIsScheduled ? ' On' : ' Off'}
              titleStyle={{ fontSize: 14 }}
              buttonStyle={{ borderWidth: 1 }}
              onPress={() => {
                if (notificationsIsScheduled) {
                  storage.set('remindersEnabled', false);
                  clearAllPrayerReminders();
                  return;
                }
                initPrayerReminders();
                storage.set('remindersEnabled', true);
              }}
            />
          </View>

          <Text style={[styles.hint, { opacity: 0.6, marginTop: 16 }]}>
            Reminders are sent 5 minutes before each prayer time
          </Text>
        </Card>

        <Card title="About">
          <View style={styles.row}>
            <Text style={styles.label}>Version</Text>
            <Text style={styles.aboutValue}>{Constants.expoConfig?.version ?? '-'}</Text>
          </View>
          {Updates.channel ? (
            <View style={[styles.row, { marginTop: 12 }]}>
              <Text style={styles.label}>Channel</Text>
              <Text style={styles.aboutValue}>{Updates.channel}</Text>
            </View>
          ) : null}
          {Constants.expoConfig?.extra?.commitHash ? (
            <View style={[styles.row, { marginTop: 12 }]}>
              <Text style={styles.label}>Commit</Text>
              <Text selectable style={styles.aboutValue}>
                {Constants.expoConfig.extra.commitHash}
              </Text>
            </View>
          ) : null}
          {Updates.createdAt ? (
            <View style={[styles.row, { marginTop: 12 }]}>
              <Text style={styles.label}>Published</Text>
              <Text style={styles.aboutValue}>
                {Updates.createdAt.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          ) : null}
          {Updates.channel ? (
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <Button
                type="outline"
                size="sm"
                radius="md"
                icon={{
                  name: updateIconName[updateStatus],
                  type: 'feather',
                  size: 18,
                }}
                title={updateTitle[updateStatus]}
                titleStyle={{ fontSize: 14 }}
                buttonStyle={{ borderWidth: 1 }}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  aboutValue: {
    fontSize: 14,
    opacity: 0.6,
  },
});
