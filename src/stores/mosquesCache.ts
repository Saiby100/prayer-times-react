import getStorage from '@/utils/localStore';
import type { Coordinates, Mosque } from '@/services/places/types';

const CACHE_KEY = 'mosques_cache';

type MosquesCacheEntry = {
  /** Full fetched mosque set (up to ~20), unsliced. */
  mosques: Mosque[];
  /** Coordinates the fetch was centred on. */
  fetchCenter: Coordinates;
  /** Local calendar day of the fetch, "YYYY-MM-DD". */
  fetchedDate: string;
};

/** Local calendar day as "YYYY-MM-DD" (uses local date parts, not UTC). */
function todayLocalKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMosquesCache(): MosquesCacheEntry | null {
  const storage = getStorage();
  if (!storage.contains(CACHE_KEY)) return null;

  const raw = storage.getString(CACHE_KEY);
  return raw ? (JSON.parse(raw) as MosquesCacheEntry) : null;
}

function setMosquesCache(entry: MosquesCacheEntry): void {
  getStorage().set(CACHE_KEY, JSON.stringify(entry));
}

function clearMosquesCache(): void {
  getStorage().delete(CACHE_KEY);
}

export { getMosquesCache, setMosquesCache, clearMosquesCache, todayLocalKey };
export type { MosquesCacheEntry };
