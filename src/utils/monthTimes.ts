/** One day's prayer times, keyed by prayer name. */
export type DayTimes = Record<string, string>;

/** One month's prayer times, keyed by `MM-DD`. */
export type MonthTimes = Record<string, DayTimes>;

/** The only year stored in `prayer_times`. Times repeat every year, so every month is read from it. */
export const DATA_YEAR = 2026;

const pad = (n: number) => String(n).padStart(2, '0');

/** `MM-DD` key for a date's calendar month and day (local time). */
export function dayKey(date: Date): string {
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** First and last `YYYY-MM-DD` dates of a month (0-based) in `DATA_YEAR`. */
export function monthRange(month: number): [string, string] {
  const lastDay = new Date(DATA_YEAR, month + 1, 0).getDate();
  const prefix = `${DATA_YEAR}-${pad(month + 1)}`;
  return [`${prefix}-01`, `${prefix}-${pad(lastDay)}`];
}

/** Apply `fn` to every day's times, keeping the `MM-DD` keys. */
export function mapDays(month: MonthTimes, fn: (times: DayTimes) => DayTimes): MonthTimes {
  return Object.fromEntries(Object.entries(month).map(([key, times]) => [key, fn(times)]));
}

/** Look up a date's times. 29 Feb falls back to 28 Feb, since `DATA_YEAR` has no leap day. */
export function getTimesForDay(month: MonthTimes, date: Date): DayTimes | undefined {
  const key = dayKey(date);
  return month[key] ?? (key === '02-29' ? month['02-28'] : undefined);
}
