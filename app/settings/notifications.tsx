import { useState } from 'react';
import { Linking, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@rneui/themed';

import Page from '@/components/Page';
import Card from '@/components/Card';
import ConfirmPopup from '@/components/ConfirmPopup';
import SettingsToggleRow from '@/components/SettingsToggleRow';
import ReminderOffsetPopup from '@/components/ReminderOffsetPopup';
import usePrayerReminders from '@/hooks/notifications/usePrayerReminders';

export default function NotificationSettings() {
  const { isEnabled, enable, disable, reminderOffset, setReminderOffset } = usePrayerReminders();
  const [offsetPopupVisible, setOffsetPopupVisible] = useState(false);
  const [blockedPopupVisible, setBlockedPopupVisible] = useState(false);

  const toggleReminders = async () => {
    if (isEnabled) {
      disable();
      return;
    }
    if ((await enable()) === 'blocked') setBlockedPopupVisible(true);
  };

  const openSettings = () => {
    setBlockedPopupVisible(false);
    Linking.openSettings();
  };

  return (
    <Page title="Notifications" options={{ headerBackVisible: true }} contentStyle={styles.content}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card gap={16}>
          <SettingsToggleRow
            label="Prayer reminders"
            iconName={isEnabled ? 'bell' : 'bell-off'}
            title={isEnabled ? ' On' : ' Off'}
            onPress={toggleReminders}
          />
          {isEnabled && (
            <SettingsToggleRow
              label="Reminder time"
              iconName="clock"
              title={` ${reminderOffset} min before`}
              onPress={() => setOffsetPopupVisible(true)}
            />
          )}
          {!isEnabled && (
            <Text style={styles.hint}>
              Enable reminders to get notified before each prayer time
            </Text>
          )}
        </Card>
      </ScrollView>
      <ReminderOffsetPopup
        visible={offsetPopupVisible}
        currentValue={reminderOffset}
        onSave={setReminderOffset}
        onClose={() => setOffsetPopupVisible(false)}
      />
      <ConfirmPopup
        visible={blockedPopupVisible}
        title="Notifications are blocked"
        message="Allow notifications for this app in Android settings to get prayer reminders."
        confirmLabel="Open settings"
        dismissLabel="Cancel"
        onConfirm={openSettings}
        onDismiss={() => setBlockedPopupVisible(false)}
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
