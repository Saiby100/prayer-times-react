import log from '@/utils/logger';
import {
  getArea,
  getCachedTimes,
  setCachedTimes,
  isRemindersEnabled,
  getReminderOffset,
  getDisabledPrayers,
} from '@/stores';
import { fetchTimes, areaToSlug } from '@/services/prayerTimes';
import { toDisplayNames } from '@/utils/prayerNames';
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

  const cached = getCachedTimes(date, area);
  if (cached) {
    return cached[date.getDate() - 1];
  }

  try {
    const slug = areaToSlug(area);
    const data = await fetchTimes(slug, date);
    const mapped = data.map(toDisplayNames);

    if (mapped.length > 0) {
      setCachedTimes(date, area, mapped);
      return mapped[date.getDate() - 1];
    }
  } catch (error) {
    log.error('scheduleReminders: error fetching times', {
      type: 'notification',
      error: String(error),
    });
  }

  return null;
}

async function clearExistingReminders(): Promise<void> {
  const scheduled = await getScheduledNotifications();
  const prayerReminders = scheduled.filter((n) => n.content.data?.type === 'prayer_reminder');
  const ids = prayerReminders.map((n) => n.identifier);

  if (ids.length > 0) {
    await clearScheduledNotifications(ids);
  }

  log.info('scheduleReminders: cleared existing reminders', {
    type: 'notification',
    expoCount: ids.length,
  });
}

async function scheduleNotificationsForDate(
  prayerTimes: Record<string, string>,
  minutesBefore: number,
  date: Date,
  skipPast: boolean
): Promise<string[]> {
  const disabledPrayers = getDisabledPrayers();

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
      channelId: 'prayer_reminder',
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
