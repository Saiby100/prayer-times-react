import { useMemo, useEffect, useState } from 'react';
import {
  createNotificationChannel,
  clearScheduledNotifications,
  requestNotificationPermission,
  getScheduledNotifications,
} from '@/services/notifications/notification';
import { scheduleTodayNotifications } from '@/services/notifications/scheduleReminders';
import getStorage from '@/utils/localStore';

function usePrayerReminders() {
  const storage = getStorage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [scheduledIds, setScheduledIds] = useState<string[]>([]);

  const isScheduled = useMemo(() => scheduledIds.length > 0, [scheduledIds]);

  useEffect(() => {
    setupNotifications();
  }, []);

  async function setupNotifications() {
    const permissionDenied = storage.getBoolean('notificationPermissionDenied') || false;
    if (permissionDenied) return;

    const result = await requestNotificationPermission();
    storage.set('notificationPermissionDenied', !result);

    if (!result) {
      setNotificationsEnabled(false);
      return;
    }

    await createNotificationChannel('prayer_reminder', 'Prayer reminder notifications');
    setNotificationsEnabled(true);

    const scheduled = await getScheduledNotifications();
    const prayerReminders = scheduled.filter((n) => n.content.data?.type === 'prayer_reminder');
    setScheduledIds(prayerReminders.map((n) => n.identifier));
  }

  async function schedule() {
    if (!notificationsEnabled) return;
    const ids = await scheduleTodayNotifications();
    setScheduledIds(ids);
  }

  async function clear() {
    await clearScheduledNotifications(scheduledIds);
    setScheduledIds([]);
  }

  return { isScheduled, schedule, clear };
}

export default usePrayerReminders;
