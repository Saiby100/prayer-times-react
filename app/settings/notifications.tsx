import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text } from '@rneui/themed';

import Page from '@/components/Page';
import Card from '@/components/Card';
import SettingsToggleRow from '@/components/SettingsToggleRow';
import ReminderOffsetPopup from '@/components/ReminderOffsetPopup';
import { setRemindersEnabled } from '@/stores';
import usePrayerReminders from '@/hooks/notifications/usePrayerReminders';

export default function NotificationSettings() {
  const { isScheduled, schedule, clear, reminderOffset, setReminderOffset } = usePrayerReminders();
  const [offsetPopupVisible, setOffsetPopupVisible] = useState(false);

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
      name="settings/notifications"
      title="Notifications"
      options={{ headerBackVisible: true }}
      contentStyle={styles.content}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Card gap={16}>
          <SettingsToggleRow
            label="Prayer reminders"
            iconName={isScheduled ? 'bell' : 'bell-off'}
            title={isScheduled ? ' On' : ' Off'}
            onPress={toggleReminders}
          />
          {isScheduled && (
            <SettingsToggleRow
              label="Reminder time"
              iconName="clock"
              title={` ${reminderOffset} min before`}
              onPress={() => setOffsetPopupVisible(true)}
            />
          )}
          {!isScheduled && (
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
