import { requireOptionalNativeModule } from 'expo';

/** A prayer alarm to schedule. */
export type PrayerAlarm = {
  /** Alarm id, `prayer_reminder:YYYY-MM-DD:<prayer>`; scheduling the same id replaces it. */
  id: string;
  /** When the alarm fires. */
  fireAt: Date;
  /** Prayer display name, e.g. "Fajr". */
  prayer: string;
  /** Prayer time text, e.g. "05:12". */
  prayerTime: string;
  /** Notification title. */
  title: string;
  /** Notification body. */
  body: string;
};

/** A prayer alarm already scheduled on the device. */
export type ScheduledAlarm = Omit<PrayerAlarm, 'fireAt'> & {
  /** Fire time in ms since the epoch. */
  fireAt: number;
};

/** The native `PrayerAlarm` module (`modules/prayer-alarm`). Android only. */
type PrayerAlarmNativeModule = {
  /** Registers an alarm, replacing any with the same id. */
  schedule(alarm: ScheduledAlarm): Promise<void>;
  /** Cancels the alarms with these ids. */
  cancel(ids: string[]): Promise<void>;
  /** Saved alarms that haven't fired yet, soonest first. */
  list(): Promise<ScheduledAlarm[]>;
};

// Null on iOS and web, and on builds made before the module existed.
const native = requireOptionalNativeModule<PrayerAlarmNativeModule>('PrayerAlarm');

/** Whether this build can schedule prayer alarms. */
export function alarmsAvailable(): boolean {
  return native != null;
}

/**
 * Schedules an alarm with the system alarm clock, replacing any with the same id. Returns the
 * id, or null when alarms aren't available. Rejects if the system won't allow exact alarms.
 */
export async function scheduleAlarm(alarm: PrayerAlarm): Promise<string | null> {
  if (!native) return null;
  await native.schedule({ ...alarm, fireAt: alarm.fireAt.getTime() });
  return alarm.id;
}

/** Cancels the alarms with these ids. */
export async function cancelAlarms(ids: string[]): Promise<void> {
  if (!native || ids.length === 0) return;
  await native.cancel(ids);
}

/** Alarms scheduled on the device that haven't fired yet, soonest first. */
export async function getScheduledAlarms(): Promise<ScheduledAlarm[]> {
  if (!native) return [];
  return await native.list();
}
