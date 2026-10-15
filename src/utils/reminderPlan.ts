import { addDays } from './date';
import { dayKey, getTimesForDay, type MonthTimes } from './monthTimes';

/** Days covered by each scheduling run: today plus the next 6. */
export const REMINDER_DAYS = 7;

/** `data.type` of every prayer reminder notification. */
export const REMINDER_TYPE = 'prayer_reminder';

/** A prayer reminder that should be scheduled. */
export type Reminder = {
  /** Notification id, `prayer_reminder:YYYY-MM-DD:<prayer>`, so scheduling it again replaces it. */
  id: string;
  /** Prayer display name. */
  prayer: string;
  /** When the reminder fires: the prayer time minus the reminder offset. */
  fireAt: Date;
  /** Notification title. */
  title: string;
  /** Notification body. */
  body: string;
};

/** A prayer reminder already scheduled on the device. */
export type ScheduledReminder = {
  /** Notification id. */
  id: string;
  /** Fire time in ms from `data.fireAt`; missing on reminders from older app versions. */
  fireAt?: number;
  /** Notification body. */
  body: string;
};

/** The reminders a run wants, and the days it had no prayer times for. */
export type ReminderPlan = {
  /** Wanted reminders, soonest first. */
  reminders: Reminder[];
  /** `YYYY-MM-DD` days in the window whose month couldn't be loaded. */
  missingDays: string[];
};

/** Local `YYYY-MM-DD` for a date. */
function isoDay(date: Date): string {
  return `${date.getFullYear()}-${dayKey(date)}`;
}

/** The `YYYY-MM-DD` day in a reminder id, or undefined for ids not made by `reminderId`. */
function reminderDay(id: string): string | undefined {
  const [type, day] = id.split(':');
  return type === REMINDER_TYPE ? day : undefined;
}

function reminderId(day: Date, prayer: string): string {
  return `${REMINDER_TYPE}:${isoDay(day)}:${prayer}`;
}

/** Midnight of today and the following days in the reminder window. */
export function upcomingDays(now: Date): Date[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Array.from({ length: REMINDER_DAYS }, (_, i) => addDays(today, i));
}

type BuildRemindersOptions = {
  /** Current time; reminders at or before it are left out. */
  now: Date;
  /** Loaded months, keyed by 0-based month. Days in a missing month are skipped. */
  months: Map<number, MonthTimes>;
  /** Minutes before the prayer time that the reminder fires. */
  minutesBefore: number;
  /** Display names of prayers the user hid. */
  hidden: string[];
};

/** Reminders for the upcoming days, soonest first. */
export function buildReminders({
  now,
  months,
  minutesBefore,
  hidden,
}: BuildRemindersOptions): ReminderPlan {
  const reminders: Reminder[] = [];
  const missingDays: string[] = [];

  for (const day of upcomingDays(now)) {
    const month = months.get(day.getMonth());
    const times = month && getTimesForDay(month, day);
    if (!times) {
      missingDays.push(isoDay(day));
      continue;
    }

    for (const [prayer, time] of Object.entries(times)) {
      if (!time || hidden.includes(prayer)) continue;

      const [hours, minutes] = time.split(':').map(Number);
      const fireAt = new Date(day);
      fireAt.setHours(hours, minutes - minutesBefore, 0, 0);
      if (fireAt <= now) continue;

      reminders.push({
        id: reminderId(day, prayer),
        prayer,
        fireAt,
        title: `${prayer} Reminder`,
        body: `${prayer} prayer at ${time}.`,
      });
    }
  }

  reminders.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
  return { reminders, missingDays };
}

/** What a run has to change to get from the scheduled reminders to the planned ones. */
export type ReminderDiff = {
  /** Reminders that are missing or differ from what's scheduled, soonest first. */
  toSchedule: Reminder[];
  /** Ids of scheduled reminders that are no longer wanted. */
  toCancel: string[];
};

/**
 * Compares planned reminders with scheduled ones. Unchanged reminders are left alone, and
 * scheduled reminders on a day the plan had no times for are kept rather than cancelled.
 */
export function diffReminders(plan: ReminderPlan, scheduled: ScheduledReminder[]): ReminderDiff {
  const scheduledById = new Map(scheduled.map((s) => [s.id, s]));
  const wantedIds = new Set(plan.reminders.map((r) => r.id));
  const missingDays = new Set(plan.missingDays);

  const toSchedule = plan.reminders.filter((r) => {
    const existing = scheduledById.get(r.id);
    return !existing || existing.fireAt !== r.fireAt.getTime() || existing.body !== r.body;
  });

  const toCancel = scheduled
    .filter((s) => {
      if (wantedIds.has(s.id)) return false;
      const day = reminderDay(s.id);
      return !(day && missingDays.has(day));
    })
    .map((s) => s.id);

  return { toSchedule, toCancel };
}
