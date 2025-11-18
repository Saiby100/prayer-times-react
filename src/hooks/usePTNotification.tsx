import React, { useEffect, useRef } from 'react';
import {
  createNotificationChannel,
  schedulePushNotification,
  requestNotificationPermission,
} from '@/utils/notification';
import getStorage from '@/utils/localStore';
import { createTask, registerNotificationTask } from '@/utils/task';

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
    if (!(await setupNotifications())) return;

    // TODO: Handle cases where notification time is on the next day
    const minutesBefore = storage.current.getNumber('prayerReminderPref') || 5;
    const formattedTimes = Object.fromEntries(
      Object.entries(todayTimes).map(([prayerName, timeString]) => {
        const dateTime = new Date();
        const [hours, minutes] = timeString.split(':').map(Number);

        dateTime.setHours(hours, minutes - minutesBefore, 0, 0);
        return [prayerName, dateTime];
      })
    );

    const prayerName = Object.keys(formattedTimes)[offset];
    schedulePushNotification({
      title: `${prayerName} Reminder`,
      body: `${prayerName} prayer is at ${todayTimes[prayerName]}.`,
      data: { offset, todayTimes: formattedTimes, type: 'prayer_reminder' },
      date: formattedTimes[prayerName],
    });
  }

  async function createReminderTask() {
    const taskName = 'SCHEDULE-PRAYER-REMINDER';
    await createTask(taskName, async ({ data }) => {
      const { type, todayTimes, offset } = data;
      if (type !== 'prayer_reminder') return;
      const prayerName = Object.keys(todayTimes)[offset];
      schedulePushNotification({
        title: `${prayerName} Reminder`,
        body: `${prayerName} prayer at ${todayTimes[prayerName]}.`,
        data: { offset: offset + 1, todayTimes, type: 'prayer_reminder' },
        date: todayTimes[prayerName],
      });
    });
    registerNotificationTask(taskName);
  }

  return { schedulePrayerReminder };
}

export default usePTNotification;
