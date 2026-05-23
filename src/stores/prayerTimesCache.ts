import getStorage from '@/utils/localStore';

function cacheKey(date: Date, area: string): string {
  return `times_${date.getMonth()}_${date.getFullYear()}_${area}`;
}

export function getCachedTimes(date: Date, area: string): Record<string, string>[] | null {
  const storage = getStorage();
  const key = cacheKey(date, area);

  if (!storage.contains(key)) return null;

  const raw = storage.getString(key);
  return raw ? JSON.parse(raw) : null;
}

export function setCachedTimes(date: Date, area: string, times: Record<string, string>[]): void {
  getStorage().set(cacheKey(date, area), JSON.stringify(times));
}
