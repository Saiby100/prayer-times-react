import { getNextDay } from '@/utils/date';
import type { DayTimes } from '@/utils/monthTimes';

/** The next prayer as an absolute moment. */
export type NextPrayer = {
  /** Prayer name, as used for the keys of `DayTimes`. */
  name: string;
  /** Date and time the prayer starts. */
  date: Date;
};

/** `day` at the `HH:MM` time of `timeStr`. */
function atTime(day: Date, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(day);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/** Earliest visible prayer of `day` starting at or after `from`. */
function firstFrom(times: DayTimes, day: Date, hidden: string[], from: Date): NextPrayer | null {
  const upcoming = Object.entries(times)
    .filter(([name]) => !hidden.includes(name))
    .map(([name, timeStr]) => ({ name, date: atTime(day, timeStr) }))
    .filter(({ date }) => date >= from)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  return upcoming[0] ?? null;
}

/**
 * Next visible prayer after `now`: the next one left today, otherwise tomorrow's first
 * (e.g. Fajr after Isha). Null when nothing is left today and tomorrow's times are unknown.
 */
export function getNextPrayer(
  todayTimes: DayTimes,
  tomorrowTimes: DayTimes | null,
  hidden: string[],
  now: Date
): NextPrayer | null {
  return (
    firstFrom(todayTimes, now, hidden, now) ??
    (tomorrowTimes ? firstFrom(tomorrowTimes, getNextDay(now), hidden, now) : null)
  );
}
