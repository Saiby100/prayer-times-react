import { useState } from 'react';
import {
  getNotificationPermission,
  requestNotificationPermission,
} from '@/services/notifications/notification';
import { ensureChannelsExist } from '@/services/notifications/setup';
import { syncPrayerReminders } from '@/services/notifications/scheduleReminders';
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

  return {
    isEnabled,
    enable,
    disable,
    reminderOffset,
    setReminderOffset,
  };
}

export default usePrayerReminders;
