import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  createNotificationChannel,
  clearScheduledNotifications,
  requestNotificationPermission,
  schedulePushNotification,
  getScheduledNotifications,
} from '@/services/notifications/notification';
import getStorage from '@/utils/localStore';

// Format prayer times with minutes before preference
function formatPrayerTimes(todayTimes: Record<string, string>, minutesBefore: number) {
  // TODO: Handle cases where minutesBefore pushed time onto the next day
  return Object.fromEntries(
    Object.entries(todayTimes).map(([prayerName, timeString]) => {
      const dateTime = new Date();
      const [hours, minutes] = timeString.split(':').map(Number);

      dateTime.setHours(hours, minutes - minutesBefore, 0, 0);
      return [prayerName, dateTime];
    })
  );
}

function usePTNotification(todayTimes: Record<string, string>) {
  const storage = useRef(getStorage());
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<Array<string>>([]);

  const notificationsIsScheduled = useMemo(() => {
    return scheduledNotifications.length > 0;
  }, [scheduledNotifications]);

  useEffect(() => {
    setupNotifications();
  }, []);

  useEffect(() => {
    if (notificationsIsScheduled) return;

    const notificationsEnabledPref = storage.current.getBoolean('remindersEnabled') || false;
    if (!notificationsEnabledPref) return;

    initPrayerReminders();
  }, [JSON.stringify(todayTimes)]);

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
      await
    }
  }

  async function initPrayerReminders() {
    if (!notificationsEnabled) return;

    await clearAllPrayerReminders();

    const minutesBefore = storage.current.getNumber('prayerReminderPref') || 5;
    const formattedTimes: Record<string, Date> = formatPrayerTimes(todayTimes, minutesBefore);

    const results = await Promise.all(
      Object.entries(formattedTimes).map(([prayerName, time]) => {
        return schedulePushNotification({
          title: `${prayerName} Reminder`,
          body: `${prayerName} prayer at ${todayTimes[prayerName]}.`,
          data: { type: 'prayer_reminder' },
          date: time,
        });
      })
    );
    setScheduledNotifications(results.filter((result): result is string => result !== null));
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

  return {
    clearAllPrayerReminders,
    initPrayerReminders,
    notificationsIsScheduled,
    getAllScheduledPrayerReminders,
  };
}

export default usePTNotification;
