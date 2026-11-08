import { useState } from 'react';
import { Linking, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@rneui/themed';

import Page from '@/components/Page';
import Card from '@/components/Card';
import ConfirmPopup from '@/components/ConfirmPopup';
import SettingsSwitchRow from '@/components/SettingsSwitchRow';
import SettingsToggleRow from '@/components/SettingsToggleRow';
import ReminderOffsetPopup from '@/components/ReminderOffsetPopup';
import ReminderTypePopup from '@/components/ReminderTypePopup';
import FullScreenAlarmWarning from '@/components/FullScreenAlarmWarning';
import usePrayerReminders from '@/hooks/notifications/usePrayerReminders';
import useAlarmPermissions from '@/hooks/notifications/useAlarmPermissions';
import type { ReminderType } from '@/stores';

export default function NotificationSettings() {
  const {
    isEnabled,
    enable,
    disable,
    reminderOffset,
    setReminderOffset,
    reminderType,
    setReminderType,
    canUseAlarms,
  } = usePrayerReminders();
  const { canFullScreen, notificationsAllowed, previewReminder, openFullScreenSettings } =
    useAlarmPermissions();
  const [offsetPopupVisible, setOffsetPopupVisible] = useState(false);
  const [typePopupVisible, setTypePopupVisible] = useState(false);
  const [blockedPopupVisible, setBlockedPopupVisible] = useState(false);
  const [fullScreenPopupVisible, setFullScreenPopupVisible] = useState(false);
  // Holds the switch on while the permission prompt and scheduling run, so it doesn't
  // snap back to off and flip on again once `enable()` resolves.
  const [turningOn, setTurningOn] = useState(false);

  // Android only: iOS and builds without the alarm module have no reminder type to pick.
  const showReminderType = isEnabled && canUseAlarms;

  const toggleReminders = async () => {
    if (turningOn) return;
    if (isEnabled) {
      disable();
      return;
    }
    setTurningOn(true);
    try {
      if ((await enable()) === 'blocked') setBlockedPopupVisible(true);
    } finally {
      setTurningOn(false);
    }
  };

  const openSettings = () => {
    setBlockedPopupVisible(false);
    Linking.openSettings();
  };

  // Alarm is saved even without full-screen access (alarms still ring); the popup then offers
  // the setting.
  const selectReminderType = (type: ReminderType) => {
    if (type === reminderType) return;
    setReminderType(type);
    if (type === 'alarm' && !canFullScreen) setFullScreenPopupVisible(true);
  };

  const openFullScreenFromPopup = () => {
    setFullScreenPopupVisible(false);
    openFullScreenSettings();
  };

  return (
    <Page title="Notifications" options={{ headerBackVisible: true }} contentStyle={styles.content}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card gap={16}>
          <SettingsSwitchRow
            label="Prayer reminders"
            value={isEnabled || turningOn}
            onValueChange={toggleReminders}
          />
          {isEnabled && (
            <SettingsToggleRow
              label="Reminder time"
              title={`${reminderOffset} min before`}
              onPress={() => setOffsetPopupVisible(true)}
            />
          )}
          {showReminderType && (
            <SettingsToggleRow
              label="Reminder type"
              title={reminderType === 'alarm' ? 'Alarm' : 'Notification'}
              onPress={() => setTypePopupVisible(true)}
            />
          )}
          {!isEnabled && (
            <Text style={styles.hint}>
              Enable reminders to get notified before each prayer time
            </Text>
          )}
        </Card>
        {showReminderType && reminderType === 'alarm' && !canFullScreen && (
          <FullScreenAlarmWarning onFix={openFullScreenSettings} />
        )}
      </ScrollView>
      <ReminderOffsetPopup
        visible={offsetPopupVisible}
        currentValue={reminderOffset}
        onSave={setReminderOffset}
        onClose={() => setOffsetPopupVisible(false)}
      />
      <ReminderTypePopup
        visible={typePopupVisible}
        currentType={reminderType}
        onSelect={selectReminderType}
        onPreview={() => previewReminder(reminderType)}
        previewDisabled={!notificationsAllowed}
        onClose={() => setTypePopupVisible(false)}
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
      <ConfirmPopup
        visible={fullScreenPopupVisible}
        title="Allow full-screen alarms"
        message="Alarms will ring, but can't show on the lock screen until you allow full-screen notifications for this app."
        confirmLabel="Open settings"
        dismissLabel="Not now"
        onConfirm={openFullScreenFromPopup}
        onDismiss={() => setFullScreenPopupVisible(false)}
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
