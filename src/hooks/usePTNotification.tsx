import { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import {
  createNotificationChannel,
  clearScheduledNotifications,
  requestNotificationPermission,
  getScheduledNotifications,
} from '@/services/notifications/notification';
import { scheduleTodayNotifications } from '@/services/notifications/backgroundTask';
import getStorage from '@/utils/localStore';

function usePTNotification() {
  const storage = useRef(getStorage());
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<string[]>([]);
  const [reminderMinutes, setReminderMinutes] = useState<number>(5);

  const notificationsIsScheduled = useMemo(() => {
    return scheduledNotifications.length > 0;
  }, [scheduledNotifications]);

  useEffect(() => {
    setupNotifications();
    loadReminderPreference();
  }, []);

  function loadReminderPreference() {
    const savedMinutes = storage.current.getNumber('prayerReminderPref') ?? 5;
    setReminderMinutes(savedMinutes);
  }

  async function setupNotifications() {
    const permissionDenied = storage.current.getBoolean('notificationPermissionDenied') || false;
    if (permissionDenied) return;

    const result = await requestNotificationPermission();
    storage.current.set('notificationPermissionDenied', !result);

    if (!result) {
      setNotificationsEnabled(false);
    } else {
      await createNotificationChannel('prayer_reminder', 'Prayer reminder notifications');
      setNotificationsEnabled(true);

      await getAllScheduledPrayerReminders();
    }
  }

  async function initPrayerReminders() {
    if (!notificationsEnabled) return;

    // Use the shared scheduling function from background task
    const scheduledIds = await scheduleTodayNotifications();
    setScheduledNotifications(scheduledIds);
  }

  async function clearAllPrayerReminders() {
    console.log('Clearing all prayer reminders', scheduledNotifications);
    await clearScheduledNotifications(scheduledNotifications);
    setScheduledNotifications([]);
  }

  async function getAllScheduledPrayerReminders() {
    const scheduled = await getScheduledNotifications().then((notifications) =>
      notifications.filter((notification) => notification.content.data?.type === 'prayer_reminder')
    );

    setScheduledNotifications(scheduled.map((scheduled) => scheduled.identifier));
    return scheduled; // todo remove
  }

  // Refresh preference from storage and reschedule if notifications are enabled
  const refreshAndReschedule = useCallback(async () => {
    const savedMinutes = storage.current.getNumber('prayerReminderPref') ?? 5;
    const remindersEnabled = storage.current.getBoolean('remindersEnabled') ?? false;

    setReminderMinutes(savedMinutes);

    // Only reschedule if reminders are enabled and preference changed
    if (remindersEnabled && notificationsEnabled) {
      await initPrayerReminders();
    }
  }, [notificationsEnabled]);

  return {
    clearAllPrayerReminders,
    initPrayerReminders,
    notificationsIsScheduled,
    getAllScheduledPrayerReminders,
    refreshAndReschedule,
    reminderMinutes,
  };
}

export default usePTNotification;
