import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchNearbyMosques,
  rankMosques,
  shouldReuseCache,
  REUSE_MARGIN_KM,
  MAX_RESULTS,
} from '@/services/places/nearbyMosques';
import type { Mosque } from '@/services/places/types';
import { clearMosquesCache, getMosquesCache, setMosquesCache, todayLocalKey } from '@/stores';
import log from '@/utils/logger';
import useLocation from './useLocation';

type NearbyMosquesState = {
  /** List of mosques sorted by distance. */
  mosques: Mosque[];
  /** Whether data is loading (location or API). */
  isLoading: boolean;
  /** Whether the API request failed. */
  error: boolean;
  /** Whether location permission was denied. */
  permissionDenied: boolean;
  /** Re-request location permission. */
  requestPermission: () => Promise<void>;
  /** Retry fetching mosques. */
  retry: () => void;
};

const useNearbyMosques = (): NearbyMosquesState => {
  const { coords, isLoading: locationLoading, permissionDenied, requestPermission } = useLocation();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (locationLoading || !coords) {
      setIsLoading(locationLoading);
      return;
    }

    let cancelled = false;
    setError(false);

    const cached = getMosquesCache();
    if (shouldReuseCache(cached, coords.lat, coords.lng, todayLocalKey(), REUSE_MARGIN_KM)) {
      log.info('useNearbyMosques: serving mosques from cache, skipping API call', {
        type: 'app',
        cachedCount: cached!.mosques.length,
        fetchedDate: cached!.fetchedDate,
      });
      setMosques(rankMosques(cached!.mosques, coords.lat, coords.lng, MAX_RESULTS));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    log.info('useNearbyMosques: cache miss, fetching nearby mosques from API', {
      type: 'app',
      reason: cached ? 'stale (different day or moved beyond margin)' : 'no cache',
    });

    fetchNearbyMosques(coords.lat, coords.lng)
      .then((results) => {
        if (cancelled || !mountedRef.current) return;
        setMosquesCache({
          mosques: results,
          fetchCenter: coords,
          fetchedDate: todayLocalKey(),
        });
        setMosques(rankMosques(results, coords.lat, coords.lng, MAX_RESULTS));
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled && mountedRef.current) {
          setError(true);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [coords, locationLoading, retryCount]);

  const retry = useCallback(() => {
    clearMosquesCache();
    setRetryCount((c) => c + 1);
  }, []);

  return { mosques, isLoading, error, permissionDenied, requestPermission, retry };
};

export default useNearbyMosques;
