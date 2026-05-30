import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { getAreaCoordinates } from '@/config/areaCoordinates';
import { getArea } from '@/stores';

type Coords = {
  /** Latitude in decimal degrees. */
  lat: number;
  /** Longitude in decimal degrees. */
  lng: number;
};

type LocationState = {
  /** Resolved coordinates, or null if unavailable. */
  coords: Coords | null;
  /** Whether location is still being resolved. */
  isLoading: boolean;
  /** Whether location permission was denied and no fallback is available. */
  permissionDenied: boolean;
  /** Re-request location permission and resolve coordinates. */
  requestPermission: () => Promise<void>;
};

const useLocation = (): LocationState => {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const resolveLocation = useCallback(async (): Promise<Coords | null> => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === 'granted') {
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        return { lat: position.coords.latitude, lng: position.coords.longitude };
      } catch {
        // GPS failed, try area fallback
      }
    }

    const area = getArea();
    if (area) {
      const fallback = getAreaCoordinates(area);
      if (fallback) return fallback;
    }

    if (status !== 'granted') {
      setPermissionDenied(true);
    }
    return null;
  }, []);

  const requestPermission = useCallback(async () => {
    setPermissionDenied(false);
    setIsLoading(true);

    const resolved = await resolveLocation();
    if (resolved) {
      setCoords(resolved);
      setPermissionDenied(false);
    }

    setIsLoading(false);
  }, [resolveLocation]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const resolved = await resolveLocation();
      if (!mounted) return;

      if (resolved) setCoords(resolved);
      setIsLoading(false);
    };

    init();

    return () => {
      mounted = false;
    };
  }, [resolveLocation]);

  return { coords, isLoading, permissionDenied, requestPermission };
};

export default useLocation;
