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
import { mapDays, type MonthTimes } from '@/utils/monthTimes';
import {
  REMINDER_TYPE,
  buildReminders,
  diffReminders,
  upcomingDays,
  type ReminderPlan,
  type ScheduledReminder,
} from '@/utils/reminderPlan';
import { createSerialRunner } from '@/utils/serialRunner';
import {
  schedulePushNotification,
  clearScheduledNotifications,
  getScheduledNotifications,
  notificationPermissionGranted,
} from './notification';

// Load a date's month for an area: from the cache, else fetched and cached.
async function loadMonth(date: Date, area: string): Promise<MonthTimes | null> {
  const cached = getCachedTimes(date, area);
  if (cached) return cached;

  try {
    const data = await fetchTimes(areaToSlug(area), date);
    const mapped = mapDays(data, toDisplayNames);

    if (Object.keys(mapped).length > 0) {
      setCachedTimes(date, area, mapped);
      return mapped;
    }
  } catch (error) {
    log.error('scheduleReminders: error fetching times', {
      type: 'notification',
      error: String(error),
    });
  }

  return null;
}

// Load each month the reminder window touches once, keyed by 0-based month.
async function loadMonths(days: Date[], area: string): Promise<Map<number, MonthTimes>> {
  const firstDayOfEachMonth = days.filter(
    (day, i) => i === 0 || day.getMonth() !== days[i - 1].getMonth()
  );
  const loaded = await Promise.all(firstDayOfEachMonth.map((day) => loadMonth(day, area)));

  const months = new Map<number, MonthTimes>();
  loaded.forEach((month, i) => {
    if (month) months.set(firstDayOfEachMonth[i].getMonth(), month);
  });
  return months;
}

async function getScheduledReminders(): Promise<ScheduledReminder[]> {
  const scheduled = await getScheduledNotifications();
  return scheduled
    .filter((n) => n.content.data?.type === REMINDER_TYPE)
    .map((n) => {
      const fireAt = n.content.data?.fireAt;
      return {
        id: n.identifier,
        fireAt: typeof fireAt === 'number' ? fireAt : undefined,
        body: n.content.body ?? '',
      };
    });
}

// The reminders that should be scheduled, or null when they can't be worked out and the
// scheduled ones should be left as they are. Reminders off → none, so all are cancelled.
async function planReminders(now: Date): Promise<ReminderPlan | null> {
  if (!isRemindersEnabled()) {
    return { reminders: [], missingDays: [] };
  }

  if (!(await notificationPermissionGranted())) {
    log.debug('scheduleReminders: notification permission not granted', { type: 'notification' });
    return null;
  }

  const area = getArea();
  if (!area) {
    log.warn('scheduleReminders: no area configured', { type: 'notification' });
    return null;
  }

  const months = await loadMonths(upcomingDays(now), area);
  if (months.size === 0) {
    log.warn('scheduleReminders: could not fetch prayer times', { type: 'notification' });
    return null;
  }

  return buildReminders({
    now,
    months,
    minutesBefore: getReminderOffset(),
    hidden: getDisabledPrayers(),
  });
}

async function sync(): Promise<void> {
  const startedAt = Date.now();

  try {
    const plan = await planReminders(new Date());
    if (!plan) return;

    const { toSchedule, toCancel } = diffReminders(plan, await getScheduledReminders());

    // Soonest first, so a run cut off partway has already covered the nearest prayers.
    const ids = await Promise.all(
      toSchedule.map((reminder) =>
        schedulePushNotification({
          identifier: reminder.id,
          title: reminder.title,
          body: reminder.body,
          data: {
            type: REMINDER_TYPE,
            prayer: reminder.prayer,
            fireAt: reminder.fireAt.getTime(),
          },
          date: reminder.fireAt,
          channelId: 'prayer_reminder',
        })
      )
    );
    toSchedule.forEach((reminder, i) => {
      if (ids[i]) {
        log.info('scheduleReminders: scheduled reminder', {
          type: 'notification',
          prayer: reminder.prayer,
          time: reminder.fireAt.toLocaleString(),
        });
      }
    });

    if (toCancel.length > 0) {
      await clearScheduledNotifications(toCancel);
    }

    log.info('scheduleReminders: sync complete', {
      type: 'notification',
      wanted: plan.reminders.length,
      scheduled: ids.filter(Boolean).length,
      cancelled: toCancel.length,
      missingDays: plan.missingDays.length,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    log.error('scheduleReminders: sync failed', { type: 'notification', error: String(error) });
  }
}

// Make the scheduled prayer reminders match the current settings: today's remaining prayers
// plus the next 6 days when reminders are on, none when off. Each reminder's id is its day and
// prayer, so only missing or changed reminders are scheduled (replacing any old one) and
// unwanted ones are cancelled; a run cut off partway loses nothing. Runs one at a time, and
// calls made during a run share one rerun.
export const syncPrayerReminders = createSerialRunner(sync);
