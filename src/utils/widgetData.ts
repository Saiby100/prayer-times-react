import { getNextDay, isSameDay } from '@/utils/date';
import { getTimesForDay, type MonthTimes } from '@/utils/monthTimes';
import { getNextPrayer, type NextPrayer } from '@/utils/nextPrayer';

/** One prayer row on a widget. */
export type PrayerRow = {
  /** Prayer display name (`Fajr`, `Thur`, `Asr(S)`…). */
  name: string;
  /** Start time, `HH:MM`. */
  time: string;
};

/** What a widget shows: an empty state, or the next prayer and its day's rows. */
export type WidgetData =
  | {
      /** No area picked yet: "Open the app to choose your area". */
      state: 'no-area';
    }
  | {
      /** The month needed isn't saved and couldn't be loaded: "Open the app to load prayer times". */
      state: 'not-loaded';
      /** The app's area. */
      area: string;
    }
  | {
      /** Every prayer is hidden: "All prayers are hidden". */
      state: 'all-hidden';
      /** The app's area. */
      area: string;
    }
  | {
      /** Times to show. */
      state: 'ready';
      /** The app's area. */
      area: string;
      /** Day the rows belong to: today, or tomorrow once today's last visible prayer has passed. */
      day: Date;
      /** That day's visible prayers, in time order. */
      rows: PrayerRow[];
      /** The next visible prayer, on `day`; its row is highlighted and its time sets the refresh. */
      next: NextPrayer;
    };

/** Inputs for `buildWidgetData`. */
export type WidgetDataInput = {
  /** The app's area, undefined before one is picked. */
  area: string | undefined;
  /** Hidden prayers' display names. */
  hidden: string[];
  /** Current time. */
  now: Date;
  /** Month holding today, or null when not loaded. */
  todayMonth: MonthTimes | null;
  /** Month holding tomorrow (often the same as `todayMonth`), or null when not loaded. */
  tomorrowMonth: MonthTimes | null;
};

/**
 * What the widgets show at `now`: the next visible prayer and the rows of its day (tomorrow's
 * after Isha, with Fajr next), or the empty state that applies.
 */
export function buildWidgetData({
  area,
  hidden,
  now,
  todayMonth,
  tomorrowMonth,
}: WidgetDataInput): WidgetData {
  if (!area) return { state: 'no-area' };

  const todayTimes = todayMonth ? getTimesForDay(todayMonth, now) : undefined;
  if (!todayTimes) return { state: 'not-loaded', area };

  if (Object.keys(todayTimes).every((name) => hidden.includes(name))) {
    return { state: 'all-hidden', area };
  }

  const tomorrow = getNextDay(now);
  const tomorrowTimes = tomorrowMonth ? (getTimesForDay(tomorrowMonth, tomorrow) ?? null) : null;
  const next = getNextPrayer(todayTimes, tomorrowTimes, hidden, now);
  if (!next) return { state: 'not-loaded', area };

  // `next` is on tomorrow only when tomorrow's times were there to pick it from.
  const dayTimes = isSameDay(next.date, now) ? todayTimes : (tomorrowTimes ?? {});
  const rows = Object.entries(dayTimes)
    .filter(([name]) => !hidden.includes(name))
    .map(([name, time]) => ({ name, time }))
    .sort((a, b) => a.time.localeCompare(b.time));

  const day = new Date(next.date);
  day.setHours(0, 0, 0, 0);
  return { state: 'ready', area, day, rows, next };
}
