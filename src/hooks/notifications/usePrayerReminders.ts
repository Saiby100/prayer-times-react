import { useMemo, useEffect, useState } from 'react';
import {
  createNotificationChannel,
  clearScheduledNotifications,
  requestNotificationPermission,
  getScheduledNotifications,
} from '@/services/notifications/notification';
import { registerAlarmCategory } from '@/services/notifications/alarmCategory';
import { scheduleTodayNotifications } from '@/services/notifications/scheduleReminders';
import {
  isNotificationPermissionDenied,
  setNotificationPermissionDenied,
  getReminderOffset,
  setReminderOffset as storeSetReminderOffset,
  getNotificationType,
  setNotificationType as storeSetNotificationType,
} from '@/stores';
import log from '@/utils/logger';

function usePrayerReminders() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [scheduledIds, setScheduledIds] = useState<string[]>([]);

  const isScheduled = useMemo(() => scheduledIds.length > 0, [scheduledIds]);

  useEffect(() => {
    setupNotifications();
  }, []);

  async function setupNotifications() {
    if (isNotificationPermissionDenied()) return;

    const result = await requestNotificationPermission();
    setNotificationPermissionDenied(!result);

    if (!result) {
      setNotificationsEnabled(false);
      return;
    }

    await Promise.all([
      createNotificationChannel({
        channelId: 'prayer_reminder',
        name: 'Prayer reminder notifications',
      }),
      createNotificationChannel({
        channelId: 'prayer_alarm',
        name: 'Prayer alarm notifications',
        sound: 'alarm.wav',
        useAlarmStream: true,
        bypassDnd: true,
      }),
      registerAlarmCategory(),
    ]);
    log.info('usePrayerReminders: notification channels created', {
      type: 'notification',
      channels: ['prayer_reminder', 'prayer_alarm'],
    });
    setNotificationsEnabled(true);

    const scheduled = await getScheduledNotifications();
    const prayerReminders = scheduled.filter((n) => n.content.data?.type === 'prayer_reminder');
    setScheduledIds(prayerReminders.map((n) => n.identifier));
  }

  async function schedule() {
    if (!notificationsEnabled) return;
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
  const notificationType = getNotificationType();

  function setReminderOffset(minutes: number) {
    storeSetReminderOffset(minutes);
    schedule();
  }

  function setNotificationType(type: 'notification' | 'alarm') {
    storeSetNotificationType(type);
    schedule();
  }

  return {
    isScheduled,
    schedule,
    clear,
    reminderOffset,
    setReminderOffset,
    notificationType,
    setNotificationType,
  };
}

export default usePrayerReminders;
