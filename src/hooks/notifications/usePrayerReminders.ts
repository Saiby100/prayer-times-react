import { useMemo, useEffect, useState } from 'react';
import {
  clearScheduledNotifications,
  getNotificationPermission,
  requestNotificationPermission,
  getScheduledNotifications,
} from '@/services/notifications/notification';
import { ensureChannelsExist } from '@/services/notifications/setup';
import { scheduleTodayNotifications } from '@/services/notifications/scheduleReminders';
import {
  setRemindersEnabled,
  getReminderOffset,
  setReminderOffset as storeSetReminderOffset,
} from '@/stores';
import log from '@/utils/logger';

/** Outcome of turning reminders on: `blocked` means only Android settings can allow them. */
export type EnableRemindersResult = 'granted' | 'denied' | 'blocked';

function usePrayerReminders() {
  const [scheduledIds, setScheduledIds] = useState<string[]>([]);

  const isScheduled = useMemo(() => scheduledIds.length > 0, [scheduledIds]);

  useEffect(() => {
    loadScheduledIds();
  }, []);

  async function loadScheduledIds() {
    const scheduled = await getScheduledNotifications();
    const prayerReminders = scheduled.filter((n) => n.content.data?.type === 'prayer_reminder');
    setScheduledIds(prayerReminders.map((n) => n.identifier));
  }

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
    await schedule();
    return 'granted';
  }

  async function disable() {
    setRemindersEnabled(false);
    await clear();
  }

  async function schedule() {
    const ids = await scheduleTodayNotifications();
    log.info('usePrayerReminders: scheduled reminders', {
      type: 'notification',
      count: ids.length,
    });
    setScheduledIds(ids);
  }

  async function clear() {
    log.info('usePrayerReminders: clearing reminders', {
      type: 'notification',
      count: scheduledIds.length,
    });
    await clearScheduledNotifications(scheduledIds);
    setScheduledIds([]);
  }

  const reminderOffset = getReminderOffset();

  function setReminderOffset(minutes: number) {
    storeSetReminderOffset(minutes);
    schedule();
  }

  return {
    isScheduled,
    enable,
    disable,
    reminderOffset,
    setReminderOffset,
  };
}

export default usePrayerReminders;
