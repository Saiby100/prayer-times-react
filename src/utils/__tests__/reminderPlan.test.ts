import type { MonthTimes } from '../monthTimes';
import {
  buildReminders,
  diffReminders,
  planSync,
  upcomingDays,
  type ReminderPlan,
  type ScheduledReminder,
} from '../reminderPlan';

const day = { Fajr: '05:00', Dhuhr: '12:30', Isha: '20:00' };

// Every day of a month (0-based) in 2026 gets the same times.
function month(m: number, times: Record<string, string> = day): MonthTimes {
  const last = new Date(2026, m + 1, 0).getDate();
  const result: MonthTimes = {};
  for (let d = 1; d <= last; d++) {
    result[`${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`] = times;
  }
  return result;
}

function build(now: Date, months: Map<number, MonthTimes>, hidden: string[] = [], offset = 10) {
  return buildReminders({ now, months, minutesBefore: offset, hidden });
}

// What a successful run leaves scheduled on the device.
function asScheduled(plan: ReminderPlan): ScheduledReminder[] {
  return plan.reminders.map((r) => ({ id: r.id, fireAt: r.fireAt.getTime(), body: r.body }));
}

describe('upcomingDays', () => {
  it('returns midnight of today and the next 6 days', () => {
    const days = upcomingDays(new Date(2026, 9, 15, 14, 30));
    expect(days).toHaveLength(7);
    expect(days[0]).toEqual(new Date(2026, 9, 15));
    expect(days[6]).toEqual(new Date(2026, 9, 21));
  });
});

describe('buildReminders', () => {
  const months = new Map([[9, month(9)]]);

  it("covers today's remaining prayers plus 6 full days, soonest first", () => {
    const { reminders, missingDays } = build(new Date(2026, 9, 15, 14, 0), months);

    // Today: only Isha left. Next 6 days: 3 each.
    expect(reminders).toHaveLength(1 + 6 * 3);
    expect(missingDays).toEqual([]);
    expect(reminders[0].id).toBe('prayer_reminder:2026-10-15:Isha');
    expect(reminders[1].id).toBe('prayer_reminder:2026-10-16:Fajr');
    const times = reminders.map((r) => r.fireAt.getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it('fires the offset before the prayer time', () => {
    const { reminders } = build(new Date(2026, 9, 15, 14, 0), months);
    expect(reminders[0].fireAt).toEqual(new Date(2026, 9, 15, 19, 50));
    expect(reminders[0].title).toBe('Isha Reminder');
    expect(reminders[0].body).toBe('Isha prayer at 20:00.');
    expect(reminders[0].prayerTime).toBe('20:00');
  });

  it('leaves out a reminder whose fire time has passed even if the prayer has not', () => {
    const { reminders } = build(new Date(2026, 9, 15, 19, 55), months);
    expect(reminders[0].id).toBe('prayer_reminder:2026-10-16:Fajr');
  });

  it('leaves out hidden prayers', () => {
    const { reminders } = build(new Date(2026, 9, 15, 0, 0), months, ['Dhuhr']);
    expect(reminders.some((r) => r.prayer === 'Dhuhr')).toBe(false);
    expect(reminders).toHaveLength(7 * 2);
  });

  it('skips and reports days whose month is not loaded', () => {
    const { reminders, missingDays } = build(new Date(2026, 9, 28, 0, 0), months);
    expect(missingDays).toEqual(['2026-11-01', '2026-11-02', '2026-11-03']);
    expect(reminders).toHaveLength(4 * 3);
  });

  it('uses both months when the window crosses into the next one', () => {
    const both = new Map([
      [9, month(9)],
      [10, month(10)],
    ]);
    const { reminders, missingDays } = build(new Date(2026, 9, 28, 0, 0), both);
    expect(missingDays).toEqual([]);
    expect(reminders.at(-1)?.id).toBe('prayer_reminder:2026-11-03:Isha');
  });

  it("uses 28 Feb's times on 29 Feb", () => {
    const { reminders, missingDays } = build(
      new Date(2028, 1, 29, 0, 0),
      new Map([
        [1, month(1)],
        [2, month(2)],
      ])
    );
    expect(missingDays).toEqual([]);
    expect(reminders[0].id).toBe('prayer_reminder:2028-02-29:Fajr');
  });
});

describe('diffReminders', () => {
  const months = new Map([[9, month(9)]]);
  const now = new Date(2026, 9, 15, 0, 0);

  it('schedules everything when nothing is scheduled', () => {
    const plan = build(now, months);
    const { toSchedule, toCancel } = diffReminders(plan, []);
    expect(toSchedule).toHaveLength(21);
    expect(toCancel).toEqual([]);
  });

  it('changes nothing when the schedule already matches', () => {
    const plan = build(now, months);
    expect(diffReminders(plan, asScheduled(plan))).toEqual({ toSchedule: [], toCancel: [] });
  });

  it('schedules only the missing ones after a run was cut off', () => {
    const plan = build(now, months);
    const partial = asScheduled(plan).slice(0, 5);
    const { toSchedule, toCancel } = diffReminders(plan, partial);
    expect(toSchedule.map((r) => r.id)).toEqual(plan.reminders.slice(5).map((r) => r.id));
    expect(toCancel).toEqual([]);
  });

  it('cancels only the hidden prayer', () => {
    const before = build(now, months);
    const after = build(now, months, ['Fajr']);
    const { toSchedule, toCancel } = diffReminders(after, asScheduled(before));
    expect(toSchedule).toEqual([]);
    expect(toCancel).toHaveLength(7);
    expect(toCancel.every((id) => id.endsWith(':Fajr'))).toBe(true);
  });

  it('reschedules every reminder when the offset changes', () => {
    const before = build(now, months, [], 10);
    const after = build(now, months, [], 15);
    const { toSchedule, toCancel } = diffReminders(after, asScheduled(before));
    expect(toSchedule).toHaveLength(21);
    expect(toCancel).toEqual([]);
  });

  it('reschedules only days whose times changed (new area)', () => {
    const before = build(now, months);
    const otherArea = month(9);
    otherArea['10-20'] = { ...day, Fajr: '05:03' };
    const after = build(now, new Map([[9, otherArea]]));
    const { toSchedule } = diffReminders(after, asScheduled(before));
    expect(toSchedule.map((r) => r.id)).toEqual(['prayer_reminder:2026-10-20:Fajr']);
  });

  it('cancels everything when reminders are off', () => {
    const before = build(now, months);
    const { toSchedule, toCancel } = diffReminders(
      { reminders: [], missingDays: [] },
      asScheduled(before)
    );
    expect(toSchedule).toEqual([]);
    expect(toCancel).toHaveLength(21);
  });

  it('keeps reminders on days whose month could not be loaded', () => {
    const both = new Map([
      [9, month(9)],
      [10, month(10)],
    ]);
    const late = new Date(2026, 9, 28, 0, 0);
    const before = build(late, both);
    const offline = build(late, months);
    const { toCancel } = diffReminders(offline, asScheduled(before));
    expect(toCancel).toEqual([]);
  });

  it('cancels reminders from older versions with random ids', () => {
    const plan = build(now, months);
    const old = { id: '3f2a-uuid', body: 'Fajr prayer at 05:00.' };
    const { toCancel } = diffReminders(plan, [...asScheduled(plan), old]);
    expect(toCancel).toEqual(['3f2a-uuid']);
  });
});

describe('planSync', () => {
  const months = new Map([[9, month(9)]]);
  const now = new Date(2026, 9, 15, 0, 0);
  const off: ReminderPlan = { reminders: [], missingDays: [] };

  it('switching to alarms schedules every alarm and cancels every notification', () => {
    const plan = build(now, months);
    const changes = planSync({
      plan,
      type: 'alarm',
      notifications: asScheduled(plan),
      alarms: [],
    });
    expect(changes.toSchedule).toHaveLength(21);
    expect(changes.cancelNotifications).toHaveLength(21);
    expect(changes.cancelAlarms).toEqual([]);
  });

  it('switching back to notifications schedules every notification and cancels every alarm', () => {
    const plan = build(now, months);
    const changes = planSync({
      plan,
      type: 'notification',
      notifications: [],
      alarms: asScheduled(plan),
    });
    expect(changes.toSchedule).toHaveLength(21);
    expect(changes.cancelNotifications).toEqual([]);
    expect(changes.cancelAlarms).toHaveLength(21);
  });

  it('cancels both types when reminders are off', () => {
    const before = asScheduled(build(now, months));
    for (const type of ['notification', 'alarm'] as const) {
      const changes = planSync({ plan: off, type, notifications: before, alarms: before });
      expect(changes.toSchedule).toEqual([]);
      expect(changes.cancelNotifications).toHaveLength(21);
      expect(changes.cancelAlarms).toHaveLength(21);
    }
  });

  it('changes nothing on a second run', () => {
    const plan = build(now, months);
    const changes = planSync({ plan, type: 'alarm', notifications: [], alarms: asScheduled(plan) });
    expect(changes).toEqual({ toSchedule: [], cancelNotifications: [], cancelAlarms: [] });
  });

  it('applies an offset change to the alarms', () => {
    const before = asScheduled(build(now, months, [], 10));
    const plan = build(now, months, [], 15);
    const changes = planSync({ plan, type: 'alarm', notifications: [], alarms: before });
    expect(changes.toSchedule).toHaveLength(21);
    expect(changes.toSchedule[0].fireAt).toEqual(new Date(2026, 9, 15, 4, 45));
    expect(changes.cancelAlarms).toEqual([]);
  });

  it('keeps missing days only for the chosen type', () => {
    const both = new Map([
      [9, month(9)],
      [10, month(10)],
    ]);
    const late = new Date(2026, 9, 28, 0, 0);
    const before = asScheduled(build(late, both));
    const offline = build(late, months);
    const changes = planSync({
      plan: offline,
      type: 'alarm',
      notifications: before,
      alarms: before,
    });
    expect(changes.cancelAlarms).toEqual([]);
    expect(changes.cancelNotifications).toHaveLength(before.length);
  });
});
