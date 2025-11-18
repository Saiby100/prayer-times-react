import React, { useEffect, useRef } from 'react';
import {
  createNotificationChannel,
  schedulePushNotification,
  requestNotificationPermission,
} from '@/utils/notification';
import getStorage from '@/utils/localStore';

function usePTNotification() {
  const storage = useRef(getStorage());

  useEffect(() => {
    setupNotifications(true);
  }, []);

  /**
   * Sets up notification permissions and channels for prayer reminders.
   * @param init - Optional flag indicating if this is an initial setup call.
   *               When true, bypasses the permission denied check. Defaults to false.
   * @returns Promise that resolves to true if notifications were successfully set up,
   *          false if permission was denied or setup failed.
   */
  async function setupNotifications(init = false) {
    const permissionDenied = storage.current.getBoolean('notificationPermissionDenied') || false;
    if (permissionDenied && !init) return false;

    const result = await requestNotificationPermission();

    storage.current.set('notificationPermissionDenied', !result);

    if (!result) return false;
    await createNotificationChannel('prayer_reminder', 'Prayer reminder notifications');

    return true;
  }

  async function schedulePrayerReminder(offset: number, todayTimes: Record<string, any>) {
    const dateTime = new Date();
    if (!(await setupNotifications())) return;
    const time = Object.values(todayTimes)[offset];
    const [hours, minutes] = time.split(':').map(Number);
    const minutesBefore = storage.current.getNumber('prayerReminderPref') || 5;

    // TODO: Handle cases where notification time is on the next day
    dateTime.setHours(hours, minutes - minutesBefore, 0, 0);
    const prayerName = Object.keys(todayTimes)[offset];
    schedulePushNotification(
      `${prayerName} Reminder`,
      `${prayerName} prayer is in ${minutesBefore} minutes (${time}).`,
      dateTime
    );
  }

  return { schedulePrayerReminder };
}

export default usePTNotification;
