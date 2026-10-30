import getStorage from '@/utils/localStore';

const TIPS_SEEN_KEY = 'qiblaTipsSeen';

export function hasSeenQiblaTips(): boolean {
  return getStorage().getBoolean(TIPS_SEEN_KEY) ?? false;
}

export function setQiblaTipsSeen(): void {
  getStorage().set(TIPS_SEEN_KEY, true);
}

const LAST_POSITION_KEY = 'qiblaLastPosition';

export type QiblaPosition = {
  /** Latitude in degrees. */
  lat: number;
  /** Longitude in degrees. */
  lng: number;
};

/** The last position the Qibla was found from, or null if none was saved (or it's unreadable). */
export function getLastQiblaPosition(): QiblaPosition | null {
  const raw = getStorage().getString(LAST_POSITION_KEY);
  if (!raw) return null;
  try {
    const { lat, lng } = JSON.parse(raw) as Partial<QiblaPosition>;
    return typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null;
  } catch {
    return null;
  }
}

export function setLastQiblaPosition(position: QiblaPosition): void {
  getStorage().set(LAST_POSITION_KEY, JSON.stringify(position));
}
