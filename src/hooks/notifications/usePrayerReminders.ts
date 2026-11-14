import { useState } from 'react';
import { ToastAndroid } from 'react-native';
import {
  getNotificationPermission,
  requestNotificationPermission,
} from '@/services/notifications/notification';
import { ensureChannelsExist } from '@/services/notifications/setup';
import { syncPrayerReminders } from '@/services/notifications/scheduleReminders';
import { sendPreviewNotification } from '@/services/notifications/testNotification';
import {
  isRemindersEnabled,
  setRemindersEnabled,
  getReminderOffset,
  setReminderOffset as storeSetReminderOffset,
  getReminderType,
  setReminderType as storeSetReminderType,
  type ReminderType,
} from '@/stores';
import { alarmsAvailable, testAlarm } from '@/services/alarms/alarm';
import log from '@/utils/logger';

/** Outcome of turning reminders on: `blocked` means only Android settings can allow them. */
export type EnableRemindersResult = 'granted' | 'denied' | 'blocked';

function usePrayerReminders() {
  // Follows the saved setting, not the scheduled count: nothing may be scheduled while
  // reminders are on (e.g. offline with no cached month).
  const [isEnabled, setIsEnabled] = useState(isRemindersEnabled);

  // Checks the real permission each time, so allowing notifications in Android settings
  // takes effect on the next tap.
  async function enable(): Promise<EnableRemindersResult> {
    const { granted, canAskAgain } = await getNotificationPermission();

    if (!granted) {
      if (!canAskAgain) {
        log.info('usePrayerReminders: permission blocked', {
          type: 'request-notification-permission',
        });
        return 'blocked';
      }
      if (!(await requestNotificationPermission())) {
        log.info('usePrayerReminders: permission denied', {
          type: 'request-notification-permission',
        });
        return 'denied';
      }
    }

    await ensureChannelsExist();
    setRemindersEnabled(true);
    setIsEnabled(true);
    // Not awaited: the switch turns on now and reminders are scheduled in the background.
    syncPrayerReminders();
    return 'granted';
  }

  // With reminders saved as off, the sync cancels every prayer reminder. It runs after any
  // scheduling already in progress, so nothing is scheduled after this.
  async function disable() {
    setRemindersEnabled(false);
    setIsEnabled(false);
    await syncPrayerReminders();
  }

  const reminderOffset = getReminderOffset();

  function setReminderOffset(minutes: number) {
    storeSetReminderOffset(minutes);
    syncPrayerReminders();
  }

  const [reminderType, setReminderTypeState] = useState(getReminderType);

  // Saves the type and re-syncs, which cancels the reminders of the other type.
  function setReminderType(type: ReminderType) {
    storeSetReminderType(type);
    setReminderTypeState(type);
    syncPrayerReminders();
  }

  // Sends a reminder of this type 5 seconds from now: the test alarm or a preview notification.
  async function previewReminder(type: ReminderType) {
    try {
      if (type === 'alarm') await testAlarm();
      else await sendPreviewNotification();
      ToastAndroid.show('Reminder preview in 5 seconds', ToastAndroid.SHORT);
    } catch (error) {
      log.warn('usePrayerReminders: failed to schedule reminder preview', {
        type: 'preview-reminder',
        reminderType: type,
        error: String(error),
      });
      ToastAndroid.show("Couldn't send the reminder preview", ToastAndroid.SHORT);
    }
  }

  return {
    isEnabled,
    enable,
    disable,
    reminderOffset,
    setReminderOffset,
    reminderType,
    setReminderType,
    previewReminder,
    // False on iOS/web and builds without the alarm module: hide the Reminder type row.
    canUseAlarms: alarmsAvailable(),
  };
}

export default usePrayerReminders;
