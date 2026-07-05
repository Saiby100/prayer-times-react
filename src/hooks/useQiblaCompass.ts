import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useSharedValue, withTiming, Easing, SharedValue } from 'react-native-reanimated';
import {
  adaptiveSmoothingAlpha,
  calculateQiblaBearing,
  getBearingCardinal,
  isHeadingAccuracyPoor,
  normalizeDegrees,
  shortestAngleDelta,
  smoothHeading,
} from '@/utils/qibla';

/** Degrees of tolerance within which the Qibla is considered aligned with the pointer. */
const ALIGNMENT_TOLERANCE_DEG = 8;

/** Consecutive poor/good accuracy readings required before flipping the calibration flag. */
const CALIBRATION_DEBOUNCE_COUNT = 2;

type QiblaCompassState = {
  /** Qibla bearing in degrees from true north (0-360). Null if location unknown. */
  qiblaBearing: number | null;
  /** Current device compass heading in degrees (0-360). Null if sensor unavailable. */
  compassHeading: number | null;
  /** Animated rotation for the compass dial in degrees. */
  dialRotation: SharedValue<number>;
  /** Whether compass/location data is still loading. */
  isLoading: boolean;
  /** Whether location is unavailable (permission denied or position lookup failed). */
  permissionDenied: boolean;
  /** Whether heading sensor is available. */
  sensorAvailable: boolean;
  /** Request location permission again. */
  requestPermission: () => Promise<void>;
  /** Readable bearing string like "24° NE". */
  bearingLabel: string;
  /** Whether the device is currently pointing at the Qibla within tolerance. */
  isAligned: boolean;
  /** Whether the magnetometer accuracy is poor and the user should recalibrate. */
  needsCalibration: boolean;
};

const useQiblaCompass = (): QiblaCompassState => {
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [sensorAvailable, setSensorAvailable] = useState(true);
  const [isAligned, setIsAligned] = useState(false);
  const [needsCalibration, setNeedsCalibration] = useState(false);

  const dialRotation = useSharedValue(0);
  const currentRotation = useRef(0);
  const previousHeading = useRef<number | null>(null);
  const qiblaBearingRef = useRef<number | null>(null);
  const alignedRef = useRef(false);
  /** Cached true-vs-magnetic north offset, used to correct magHeading fallbacks. */
  const declination = useRef(0);
  /** Running count of consecutive readings agreeing with the pending calibration state. */
  const calibrationStreak = useRef(0);
  const needsCalibrationRef = useRef(false);

  const resolveLocation = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    // The compass requires the user's live location — there is no fallback.
    if (status !== 'granted') {
      setPermissionDenied(true);
      return null;
    }

    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return { lat: position.coords.latitude, lng: position.coords.longitude };
    } catch {
      setPermissionDenied(true);
      return null;
    }
  }, []);

  const startHeadingUpdates =
    useCallback(async (): Promise<Location.LocationSubscription | null> => {
      try {
        return await Location.watchHeadingAsync((headingData) => {
          // Both the Qibla bearing and the compass must share the true-north frame.
          // When trueHeading is available, cache the device's true-vs-magnetic offset
          // so we can correct magHeading during moments trueHeading is unavailable.
          let corrected: number;
          if (headingData.trueHeading >= 0) {
            declination.current = shortestAngleDelta(
              headingData.magHeading,
              headingData.trueHeading
            );
            corrected = headingData.trueHeading;
          } else {
            corrected = normalizeDegrees(headingData.magHeading + declination.current);
          }

          // Surface magnetometer calibration state (debounced to avoid flicker).
          const poor = isHeadingAccuracyPoor(headingData.accuracy, Platform.OS);
          if (poor === needsCalibrationRef.current) {
            calibrationStreak.current = 0;
          } else if (++calibrationStreak.current >= CALIBRATION_DEBOUNCE_COUNT) {
            calibrationStreak.current = 0;
            needsCalibrationRef.current = poor;
            setNeedsCalibration(poor);
          }

          // Adaptive low-pass filter: hold the needle steady against jitter, but
          // follow real turns responsively. Tiny changes fall inside the dead-zone
          // (alpha 0) and are dropped entirely so the compass stops bouncing.
          let heading: number;
          if (previousHeading.current === null) {
            heading = corrected;
          } else {
            const delta = shortestAngleDelta(previousHeading.current, corrected);
            const alpha = adaptiveSmoothingAlpha(delta);
            if (alpha === 0) return;
            heading = smoothHeading(previousHeading.current, corrected, alpha);
          }
          previousHeading.current = heading;

          setCompassHeading(heading);

          const bearing = qiblaBearingRef.current;
          if (bearing !== null) {
            const aligned =
              Math.abs(shortestAngleDelta(heading, bearing)) <= ALIGNMENT_TOLERANCE_DEG;
            if (aligned !== alignedRef.current) {
              alignedRef.current = aligned;
              setIsAligned(aligned);
              if (aligned) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              }
            }
          }

          const targetRotation =
            currentRotation.current + shortestAngleDelta(currentRotation.current, -heading);
          currentRotation.current = targetRotation;

          dialRotation.value = withTiming(targetRotation, {
            duration: 120,
            easing: Easing.out(Easing.quad),
          });
        });
      } catch {
        setSensorAvailable(false);
        return null;
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
    qiblaBearingRef.current = qiblaBearing;
  }, [qiblaBearing]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const coords = await resolveLocation();
      if (!mounted) return;

      if (coords) {
        setQiblaBearing(calculateQiblaBearing(coords.lat, coords.lng));
      }

      if (mounted) setIsLoading(false);
    };

    init();

    return () => {
      mounted = false;
    };
  }, [resolveLocation]);

  // Only run the compass sensor while the Qibla screen is focused. Tab screens
  // stay mounted in the background, so without this the heading subscription
  // keeps updating and firing alignment haptics even on other tabs (e.g. Home).
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      let subscription: Location.LocationSubscription | null = null;

      startHeadingUpdates().then((sub) => {
        if (cancelled) {
          sub?.remove();
          return;
        }
        subscription = sub;
      });

      return () => {
        cancelled = true;
        subscription?.remove();
        previousHeading.current = null;
        alignedRef.current = false;
        setIsAligned(false);
      };
    }, [startHeadingUpdates])
  );

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
    isAligned,
    needsCalibration,
  };
};

export default useQiblaCompass;
