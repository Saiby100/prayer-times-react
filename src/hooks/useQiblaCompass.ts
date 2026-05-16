import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { useSharedValue, withTiming, Easing, SharedValue } from 'react-native-reanimated';
import { calculateQiblaBearing, getBearingCardinal } from '@/utils/qibla';
import { getAreaCoordinates } from '@/config/areaCoordinates';
import getStorage from '@/utils/localStore';

type QiblaCompassState = {
  /** Qibla bearing in degrees from true north (0-360). Null if location unknown. */
  qiblaBearing: number | null;
  /** Current device compass heading in degrees (0-360). Null if sensor unavailable. */
  compassHeading: number | null;
  /** Animated rotation for the compass dial in degrees. */
  dialRotation: SharedValue<number>;
  /** Whether compass/location data is still loading. */
  isLoading: boolean;
  /** Whether location permission was denied and no fallback is available. */
  permissionDenied: boolean;
  /** Whether heading sensor is available. */
  sensorAvailable: boolean;
  /** Request location permission again. */
  requestPermission: () => Promise<void>;
  /** Readable bearing string like "24° NE". */
  bearingLabel: string;
};

const shortestAngleDelta = (from: number, to: number): number => {
  const diff = ((to - from + 540) % 360) - 180;
  return diff;
};

const useQiblaCompass = (): QiblaCompassState => {
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [sensorAvailable, setSensorAvailable] = useState(true);

  const dialRotation = useSharedValue(0);
  const currentRotation = useRef(0);
  const headingSubscription = useRef<Location.LocationSubscription | null>(null);
  const previousHeading = useRef<number | null>(null);

  const resolveLocation = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
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

    const storage = getStorage();
    const area = storage.getString('area');
    if (area) {
      const coords = getAreaCoordinates(area);
      if (coords) return coords;
    }

    if (status !== 'granted') {
      setPermissionDenied(true);
    }
    return null;
  }, []);

  const startHeadingUpdates = useCallback(async () => {
    try {
      headingSubscription.current = await Location.watchHeadingAsync((headingData) => {
        const heading =
          headingData.trueHeading >= 0 ? headingData.trueHeading : headingData.magHeading;

        if (previousHeading.current !== null) {
          const delta = Math.abs(shortestAngleDelta(previousHeading.current, heading));
          if (delta < 0.5) return;
        }
        previousHeading.current = heading;

        setCompassHeading(heading);

        const targetRotation =
          currentRotation.current + shortestAngleDelta(currentRotation.current, -heading);
        currentRotation.current = targetRotation;

        dialRotation.value = withTiming(targetRotation, {
          duration: 150,
          easing: Easing.out(Easing.quad),
        });
      });
    } catch {
      setSensorAvailable(false);
    }
  }, [dialRotation]);

  const requestPermission = useCallback(async () => {
    setPermissionDenied(false);
    setIsLoading(true);

    const coords = await resolveLocation();
    if (coords) {
      setQiblaBearing(calculateQiblaBearing(coords.lat, coords.lng));
      setPermissionDenied(false);
    }

    setIsLoading(false);
  }, [resolveLocation]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const coords = await resolveLocation();
      if (!mounted) return;

      if (coords) {
        setQiblaBearing(calculateQiblaBearing(coords.lat, coords.lng));
      }

      await startHeadingUpdates();
      if (mounted) setIsLoading(false);
    };

    init();

    return () => {
      mounted = false;
      if (headingSubscription.current) {
        headingSubscription.current.remove();
      }
    };
  }, [resolveLocation, startHeadingUpdates]);

  const bearingLabel =
    qiblaBearing !== null ? `${Math.round(qiblaBearing)}° ${getBearingCardinal(qiblaBearing)}` : '';

  return {
    qiblaBearing,
    compassHeading,
    dialRotation,
    isLoading,
    permissionDenied,
    sensorAvailable,
    requestPermission,
    bearingLabel,
  };
};

export default useQiblaCompass;
