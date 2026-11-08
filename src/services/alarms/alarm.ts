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
  /** Rings a test alarm 5 seconds from now, replacing a pending snooze. */
  test(): Promise<void>;
  /** Saves the theme colours the ringing screen uses. */
  setTheme(colors: AlarmThemeColors): Promise<void>;
  /** Whether the ringing screen may show over the lock screen. */
  canUseFullScreenIntent(): boolean;
  /** Opens Android's full-screen notification setting for the app. */
  openFullScreenIntentSettings(): Promise<void>;
};

/** The theme colours the native ringing screen uses, as `#RRGGBB`. */
export type AlarmThemeColors = {
  /** Screen background. */
  background: string;
  /** Clock and secondary text. */
  text: string;
  /** Prayer name, Snooze outline and the Dismiss button. */
  primary: string;
  /** Snooze button fill. */
  bgLight: string;
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

/**
 * Rings a test alarm 5 seconds from now (sound, vibration, Snooze and Dismiss), whichever
 * reminder type is picked. Does nothing when alarms aren't available. Rejects if the system won't
 * allow exact alarms.
 */
export async function testAlarm(): Promise<void> {
  if (!native) return;
  await native.test();
}

/**
 * Saves the current theme's colours for the native ringing screen, which can't read the app's
 * theme itself (it shows before JS starts, even before the first unlock).
 */
export async function setAlarmTheme(colors: AlarmThemeColors): Promise<void> {
  if (!native) return;
  await native.setTheme(colors);
}

/**
 * Whether a ringing alarm can show its full-screen screen over the lock screen. False only on
 * Android 14+ when Play or the user took the permission away; alarms then ring with a heads-up
 * notification only. True when alarms aren't available.
 */
export function canUseFullScreenIntent(): boolean {
  return native?.canUseFullScreenIntent() ?? true;
}

/**
 * Opens Android's "full-screen notifications" setting for the app (Android 14+), or the app's
 * notification settings on older versions. Does nothing when alarms aren't available.
 */
export async function openFullScreenIntentSettings(): Promise<void> {
  if (!native) return;
  await native.openFullScreenIntentSettings();
}
