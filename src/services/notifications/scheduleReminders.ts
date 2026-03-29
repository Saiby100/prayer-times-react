import PTApi from '@/utils/PTApi';
import log from '@/utils/logger';
import * as Notifications from 'expo-notifications';
import {
  getArea,
  getCachedTimes,
  setCachedTimes,
  isRemindersEnabled,
  getReminderOffset,
  getDisabledPrayers,
  getNotificationType,
} from '@/stores';
import {
  schedulePushNotification,
  clearScheduledNotifications,
  getScheduledNotifications,
} from './notification';

// Format prayer times for a specific date with minutes before preference
function formatPrayerTimes(
  prayerTimes: Record<string, string>,
  minutesBefore: number,
  date: Date
): Record<string, Date> {
  const result: Record<string, Date> = {};

  for (const [prayerName, timeString] of Object.entries(prayerTimes)) {
    if (!timeString) {
      continue;
    }

    const dateTime = new Date(date);
    const [hours, minutes] = timeString.split(':').map(Number);
    dateTime.setHours(hours, minutes - minutesBefore, 0, 0);
    result[prayerName] = dateTime;
  }

  return result;
}

// Fetch prayer times for a given date
async function fetchPrayerTimesForDate(date: Date): Promise<Record<string, string> | null> {
  const area = getArea();

  if (!area) {
    log.warn('scheduleReminders: no area configured', { type: 'notification' });
    return null;
  }

  // Try to get from cache first
  const cached = getCachedTimes(date, area);
  if (cached) {
    return cached[date.getDate() - 1];
  }

  // Fetch from API if not in cache
  try {
    const api = new PTApi();
    api.setArea(area);
    const times = await api.fetchTimes(date);

    if (times && times.length > 0) {
      setCachedTimes(date, area, times as Record<string, string>[]);
      return times[date.getDate() - 1] as Record<string, string>;
    }
  } catch (error) {
    log.error('scheduleReminders: error fetching times', {
      type: 'notification',
      error: String(error),
    });
  }

  return null;
}

// Clear existing prayer reminders
async function clearExistingReminders(): Promise<void> {
  const scheduled = await getScheduledNotifications();
  const prayerReminders = scheduled.filter((n) => n.content.data?.type === 'prayer_reminder');
  const ids = prayerReminders.map((n) => n.identifier);

  if (ids.length > 0) {
    await clearScheduledNotifications(ids);
    log.info('scheduleReminders: cleared existing reminders', {
      type: 'notification',
      count: ids.length,
    });
  }
}

async function scheduleNotificationsForDate(
  prayerTimes: Record<string, string>,
  minutesBefore: number,
  date: Date,
  skipPast: boolean
): Promise<string[]> {
  const disabledPrayers = getDisabledPrayers();
  const notificationType = getNotificationType();
  const isAlarm = notificationType === 'alarm';

  const formattedTimes = formatPrayerTimes(prayerTimes, minutesBefore, date);
  const now = new Date();
  const scheduledIds: string[] = [];

  for (const [prayerName, reminderTime] of Object.entries(formattedTimes)) {
    if (disabledPrayers.includes(prayerName)) {
      log.debug('scheduleReminders: skipping disabled prayer', {
        type: 'notification',
        prayer: prayerName,
      });
      continue;
    }

    if (skipPast && reminderTime <= now) {
      log.debug('scheduleReminders: skipping prayer, time passed', {
        type: 'notification',
        prayer: prayerName,
      });
      continue;
    }

    const id = await schedulePushNotification({
      title: `${prayerName} Reminder`,
      body: `${prayerName} prayer at ${prayerTimes[prayerName]}.`,
      data: { type: 'prayer_reminder', prayer: prayerName },
      date: reminderTime,
      channelId: isAlarm ? 'prayer_alarm' : 'prayer_reminder',
      priority: Notifications.AndroidNotificationPriority.MAX,
      sticky: isAlarm,
    });

    if (id) {
      scheduledIds.push(id);
      log.info('scheduleReminders: scheduled reminder', {
        type: 'notification',
        prayer: prayerName,
        time: reminderTime.toLocaleTimeString(),
      });
    }
  }

  return scheduledIds;
}

// Schedule notifications for today's remaining prayers and all of tomorrow's prayers.
// Scheduling tomorrow ensures early morning prayers (e.g. Fajr) are covered even if
// the background task fires after they would have passed.
export async function scheduleTodayNotifications(): Promise<string[]> {
  if (!isRemindersEnabled()) {
    log.debug('scheduleReminders: reminders are disabled', { type: 'notification' });
    return [];
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayTimes, tomorrowTimes] = await Promise.all([
    fetchPrayerTimesForDate(today),
    fetchPrayerTimesForDate(tomorrow),
  ]);

  if (!todayTimes && !tomorrowTimes) {
    log.warn('scheduleReminders: could not fetch prayer times', { type: 'notification' });
    return [];
  }

  const minutesBefore = getReminderOffset();

  // Clear existing reminders before rescheduling
  await clearExistingReminders();

  const scheduledIds: string[] = [];

  if (todayTimes) {
    const ids = await scheduleNotificationsForDate(todayTimes, minutesBefore, today, true);
    scheduledIds.push(...ids);
  }

  if (tomorrowTimes) {
    const ids = await scheduleNotificationsForDate(tomorrowTimes, minutesBefore, tomorrow, false);
    scheduledIds.push(...ids);
  }

  log.info('scheduleReminders: scheduling complete', {
    type: 'notification',
    count: scheduledIds.length,
  });
  return scheduledIds;
}
