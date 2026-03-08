import { StyleSheet, View } from 'react-native';
import { Button, Text, useThemeMode } from '@rneui/themed';

import Page from '@/components/Page';
import Card from '@/components/Card';
import getStorage from '@/utils/localStore';
import usePTNotification from '@/hooks/usePTNotification';
import useHijriDate from '@/hooks/useHijriDate';

export default function Settings() {
  const { mode, setMode } = useThemeMode();
  const storage = getStorage();
  const { clearAllPrayerReminders, initPrayerReminders, notificationsIsScheduled } =
    usePTNotification();
  const { showHijri, toggleShowHijri, hijriSupported } = useHijriDate(new Date());

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
});
