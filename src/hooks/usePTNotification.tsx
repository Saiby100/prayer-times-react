import React, { useEffect, useRef } from 'react';
import {
  createNotificationChannel,
  notificationPermissionGranted,
  schedulePushNotification,
} from '@/utils/notification';
import getStorage from '@/utils/localStore';

function usePTNotification() {
  const storage = useRef(getStorage());

  useEffect(() => {
    setupNotifications();
  }, []);

  async function setupNotifications() {
    const granted = await notificationPermissionGranted(true);
    if (!granted) return;
    console.log('Notification permission granted.');

    await createNotificationChannel('prayer_reminder', 'Prayer reminder notifications');
  }

  async function schedulePrayerTimeNotification(offset: number, todayTimes: Record<string, any>) {
    const dateTime = new Date();
    const time = Object.values(todayTimes)[offset];
    const [hours, minutes] = time.split(':').map(Number);
    const minutesBefore = storage.current.getNumber('prayerReminderPref') || 5;

    // TODO: Handle cases where notification time is on the next day
    dateTime.setHours(hours, minutes - minutesBefore, 0, 0);
    schedulePushNotification(
      'Prayer Time Reminder',
      `It's time for ${Object.keys(todayTimes)[offset]} prayer.`,
      dateTime
    );
  }

  return { schedulePrayerTimeNotification };
}

export default usePTNotification;
