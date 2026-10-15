import getStorage from '@/utils/localStore';
import type { MonthTimes } from '@/utils/monthTimes';

// Keyed by month only: times repeat every year, so a cached month is reused in later years.
function cacheKey(date: Date, area: string): string {
  return `times_${date.getMonth()}_${area}`;
}

export function getCachedTimes(date: Date, area: string): MonthTimes | null {
  const storage = getStorage();
  const key = cacheKey(date, area);

  if (!storage.contains(key)) return null;

  const raw = storage.getString(key);
  return raw ? JSON.parse(raw) : null;
}

export function setCachedTimes(date: Date, area: string, times: MonthTimes): void {
  getStorage().set(cacheKey(date, area), JSON.stringify(times));
}
