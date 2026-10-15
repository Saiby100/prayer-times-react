import { useState } from 'react';
import {
  getNotificationPermission,
  requestNotificationPermission,
} from '@/services/notifications/notification';
import { ensureChannelsExist } from '@/services/notifications/setup';
import {
  clearExistingReminders,
  scheduleTodayNotifications,
} from '@/services/notifications/scheduleReminders';
import {
  isRemindersEnabled,
  setRemindersEnabled,
  getReminderOffset,
  setReminderOffset as storeSetReminderOffset,
} from '@/stores';
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
        log.info('usePrayerReminders: permission blocked', { type: 'notification' });
        return 'blocked';
      }
      if (!(await requestNotificationPermission())) {
        log.info('usePrayerReminders: permission denied', { type: 'notification' });
        return 'denied';
      }
    }

    await ensureChannelsExist();
    setRemindersEnabled(true);
    setIsEnabled(true);
    await schedule();
    return 'granted';
  }

  // Cancels every prayer reminder, including ones left over when a reschedule couldn't load times.
  async function disable() {
    setRemindersEnabled(false);
    setIsEnabled(false);
    await clearExistingReminders();
  }

  async function schedule() {
    const ids = await scheduleTodayNotifications();
    log.info('usePrayerReminders: scheduled reminders', {
      type: 'notification',
      count: ids.length,
    });
  }

  const reminderOffset = getReminderOffset();

  function setReminderOffset(minutes: number) {
    storeSetReminderOffset(minutes);
    schedule();
  }

  return {
    isEnabled,
    enable,
    disable,
    reminderOffset,
    setReminderOffset,
  };
}

export default usePrayerReminders;
