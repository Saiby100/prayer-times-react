import log from '@/utils/logger';
import {
  getArea,
  getCachedTimes,
  setCachedTimes,
  isRemindersEnabled,
  getReminderOffset,
  getDisabledPrayers,
  getReminderType,
  type ReminderType,
} from '@/stores';
import {
  alarmsAvailable,
  cancelAlarms as cancelPrayerAlarms,
  getScheduledAlarms,
  scheduleAlarm,
} from '@/services/alarms/alarm';
import { fetchTimes, areaToSlug } from '@/services/prayerTimes';
import { toDisplayNames } from '@/utils/prayerNames';
import { mapDays, type MonthTimes } from '@/utils/monthTimes';
import {
  REMINDER_DAYS,
  REMINDER_TYPE,
  buildReminders,
  planSync,
  upcomingDays,
  type Reminder,
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
      type: 'sync-reminders',
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
async function planReminders(): Promise<ReminderPlan | null> {
  if (!isRemindersEnabled()) {
    return { reminders: [], missingDays: [] };
  }

  if (!(await notificationPermissionGranted())) {
    log.debug('scheduleReminders: notification permission not granted', {
      type: 'sync-reminders',
    });
    return null;
  }

  const area = getArea();
  if (!area) {
    log.warn('scheduleReminders: no area configured', { type: 'sync-reminders' });
    return null;
  }

  const months = await loadMonths(upcomingDays(new Date()), area);
  if (months.size === 0) {
    log.warn('scheduleReminders: could not fetch prayer times', { type: 'sync-reminders' });
    return null;
  }

  // Read the time after loading: a reminder that fired during a slow fetch is no longer
  // scheduled, so with an older time it would look missing and be scheduled again in the past.
  return buildReminders({
    now: new Date(),
    months,
    minutesBefore: getReminderOffset(),
    hidden: getDisabledPrayers(),
  });
}

async function getScheduledPrayerAlarms(): Promise<ScheduledReminder[]> {
  const alarms = await getScheduledAlarms();
  return alarms.map(({ id, fireAt, body }) => ({ id, fireAt, body }));
}

// The type the sync schedules: a saved Alarm only counts where the alarm module exists, so iOS
// and builds without it keep getting notifications.
function effectiveReminderType(): ReminderType {
  return getReminderType() === 'alarm' && alarmsAvailable() ? 'alarm' : 'notification';
}

// Schedules reminders as notifications; returns the ids of the ones scheduled.
async function scheduleNotifications(reminders: Reminder[]): Promise<(string | null)[]> {
  return await Promise.all(
    reminders.map((reminder) =>
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
}

// Schedules reminders as alarms, each on its own so one failure (e.g. exact alarms not allowed)
// doesn't stop the rest. Failed ones stay unscheduled, with no notification instead; the next
// sync retries them. Returns the ids of the ones scheduled.
async function schedulePrayerAlarms(reminders: Reminder[]): Promise<(string | null)[]> {
  const results = await Promise.allSettled(
    reminders.map((reminder) =>
      scheduleAlarm({
        id: reminder.id,
        fireAt: reminder.fireAt,
        prayer: reminder.prayer,
        prayerTime: reminder.prayerTime,
        title: reminder.title,
        body: reminder.body,
      })
    )
  );

  const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
  if (failures.length > 0) {
    log.warn('scheduleReminders: failed to schedule alarms', {
      type: 'sync-reminders',
      reminderType: 'alarm',
      failed: failures.length,
      of: reminders.length,
      error: String(failures[0].reason),
    });
  }

  return results.map((r) => (r.status === 'fulfilled' ? r.value : null));
}

async function sync(): Promise<void> {
  const startedAt = Date.now();

  try {
    const plan = await planReminders();
    if (!plan) return;

    const reminderType = effectiveReminderType();
    const [notifications, alarms] = await Promise.all([
      getScheduledReminders(),
      getScheduledPrayerAlarms(),
    ]);
    const { toSchedule, cancelNotifications, cancelAlarms } = planSync({
      plan,
      type: reminderType,
      notifications,
      alarms,
    });

    // Schedule before cancelling, soonest first, so a run cut off partway has already covered
    // the nearest prayers and, when switching type, leaves both rather than neither.
    const ids =
      reminderType === 'alarm'
        ? await schedulePrayerAlarms(toSchedule)
        : await scheduleNotifications(toSchedule);
    toSchedule.forEach((reminder, i) => {
      if (ids[i]) {
        log.debug('scheduleReminders: scheduled reminder', {
          type: 'sync-reminders',
          reminderType,
          prayer: reminder.prayer,
          time: reminder.fireAt.toLocaleString(),
        });
      }
    });

    if (cancelNotifications.length > 0) {
      await clearScheduledNotifications(cancelNotifications);
    }
    await cancelPrayerAlarms(cancelAlarms);

    // Warn so this reaches Supabase: with reminders on, none wanted is likely a fault.
    if (plan.reminders.length === 0 && isRemindersEnabled()) {
      log.warn('scheduleReminders: 0 reminders scheduled while reminders are enabled', {
        type: 'sync-reminders',
        reminderType,
        hidden: getDisabledPrayers(),
        missingDays: plan.missingDays,
      });
    }

    log.info('scheduleReminders: sync complete', {
      type: 'sync-reminders',
      reminderType,
      wanted: plan.reminders.length,
      scheduled: ids.filter(Boolean).length,
      cancelledNotifications: cancelNotifications.length,
      cancelledAlarms: cancelAlarms.length,
      days: REMINDER_DAYS - plan.missingDays.length,
      missingDays: plan.missingDays.length,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    log.error('scheduleReminders: sync failed', { type: 'sync-reminders', error: String(error) });
  }
}

// Make the scheduled prayer reminders match the current settings: today's remaining prayers
// plus the next 6 days when reminders are on, none when off, as notifications or alarms by the
// reminder type (the other type is cancelled). Each reminder's id is its day and
// prayer, so only missing or changed reminders are scheduled (replacing any old one) and
// unwanted ones are cancelled; a run cut off partway loses nothing. Runs one at a time, and
// calls made during a run share one rerun.
export const syncPrayerReminders = createSerialRunner(sync);
