import { supabase } from '@/utils/supabase';
import { calculateDistanceKm } from '@/utils/distance';
import log from '@/utils/logger';
import type { MosquesCacheEntry } from '@/stores/mosquesCache';
import type { Mosque } from './types';

/** Reuse a cached result if the user has moved no more than this many km. */
const REUSE_MARGIN_KM = 2;
/** Maximum number of mosques shown to the user. */
const MAX_RESULTS = 10;

/** Recompute each mosque's distance from (lat,lng), sort ascending, take `limit`. */
const rankMosques = (mosques: Mosque[], lat: number, lng: number, limit?: number): Mosque[] => {
  const ranked = mosques
    .map((mosque) => ({
      ...mosque,
      distanceKm: calculateDistanceKm(lat, lng, mosque.location.lat, mosque.location.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return limit != null ? ranked.slice(0, limit) : ranked;
};

/** True if the cache is from today and within `marginKm` of the current location. */
const shouldReuseCache = (
  entry: MosquesCacheEntry | null,
  lat: number,
  lng: number,
  today: string,
  marginKm: number
): boolean => {
  if (!entry || entry.fetchedDate !== today) return false;

  const moved = calculateDistanceKm(lat, lng, entry.fetchCenter.lat, entry.fetchCenter.lng);
  return moved <= marginKm;
};

/** A mosque as returned by the nearby-mosques Edge Function (distance is computed client-side). */
type NearbyMosquePayload = Omit<Mosque, 'distanceKm'>;

const fetchNearbyMosques = async (lat: number, lng: number): Promise<Mosque[]> => {
  if (!supabase) {
    log.error('nearbyMosques: supabase not initialised', { type: 'api' });
    throw new Error('Supabase not initialised');
  }

  try {
    const { data, error } = await supabase.functions.invoke<{ mosques: NearbyMosquePayload[] }>(
      'nearby-mosques',
      { body: { lat, lng } }
    );

    if (error || !data) {
      log.warn('nearbyMosques: Edge Function returned an error', {
        type: 'api',
        error: error ? String(error) : 'no data',
      });
      throw error ?? new Error('Empty response from nearby-mosques');
    }

    const mosques: Mosque[] = (data.mosques ?? []).map((m) => ({
      ...m,
      distanceKm: calculateDistanceKm(lat, lng, m.location.lat, m.location.lng),
    }));

    return mosques.sort((a, b) => a.distanceKm - b.distanceKm);
  } catch (e) {
    log.warn('nearbyMosques: failed to fetch nearby mosques', {
      type: 'api',
      error: String(e),
    });
    throw e;
  }
};

export { fetchNearbyMosques, rankMosques, shouldReuseCache, REUSE_MARGIN_KM, MAX_RESULTS };
