import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchNearbyMosques } from '@/services/places/nearbyMosques';
import type { Mosque } from '@/services/places/types';
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
    setIsLoading(true);
    setError(false);

    fetchNearbyMosques(coords.lat, coords.lng)
      .then((results) => {
        if (!cancelled && mountedRef.current) {
          setMosques(results);
          setIsLoading(false);
        }
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
    setRetryCount((c) => c + 1);
  }, []);

  return { mosques, isLoading, error, permissionDenied, requestPermission, retry };
};

export default useNearbyMosques;
