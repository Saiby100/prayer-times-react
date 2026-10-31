import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { DeviceMotion } from 'expo-sensors';
import { useSharedValue, withTiming, Easing, SharedValue } from 'react-native-reanimated';
import {
  adaptiveSmoothingAlpha,
  calculateQiblaBearing,
  getBearingCardinal,
  headingFromRotationAlpha,
  isHeadingAccuracyPoor,
  normalizeDegrees,
  shortestAngleDelta,
  smoothHeading,
} from '@/utils/qibla';

/** Degrees of tolerance within which the Qibla is considered aligned with the pointer. */
const ALIGNMENT_TOLERANCE_DEG = 8;

/** Consecutive poor/good accuracy readings required before flipping the calibration flag. */
const CALIBRATION_DEBOUNCE_COUNT = 2;

/** Milliseconds between Android DeviceMotion (rotation vector) heading updates (~30 Hz). */
const DEVICE_MOTION_INTERVAL_MS = 33;

/**
 * How long the dial takes to turn to a new heading. Android's rotation vector only gives
 * a new reading about every 200 ms (expo-sensors uses the normal sensor rate without the
 * HIGH_SAMPLING_RATE_SENSORS permission), so a shorter turn leaves the dial pausing
 * between readings.
 */
const DIAL_ANIMATION_MS = 200;

/**
 * Why the Qibla can't be shown:
 * - `can-ask` — permission denied, but the system prompt can still be shown
 * - `blocked` — permission denied and the system won't prompt again (settings only)
 * - `unavailable` — permission granted, but no position (location services off / no fix)
 */
export type LocationError = 'can-ask' | 'blocked' | 'unavailable';

type QiblaPosition = {
  /** Latitude in degrees. */
  lat: number;
  /** Longitude in degrees. */
  lng: number;
};

type QiblaCompassState = {
  /** Qibla bearing in degrees from true north (0-360). Null if location unknown. */
  qiblaBearing: number | null;
  /** Animated rotation for the compass dial in degrees. */
  dialRotation: SharedValue<number>;
  /** Whether compass/location data is still loading. */
  isLoading: boolean;
  /** Why the location couldn't be found, or null when there is no problem. */
  locationError: LocationError | null;
  /** Whether heading sensor is available. */
  sensorAvailable: boolean;
  /** Ask for location permission (if still allowed) and look up the position again. */
  retry: () => Promise<void>;
  /** Readable bearing string like "24° NE". */
  bearingLabel: string;
  /** Whether the device is currently pointing at the Qibla within tolerance. */
  isAligned: SharedValue<boolean>;
  /** Whether the magnetometer accuracy is poor and the user should recalibrate. */
  needsCalibration: boolean;
};

const useQiblaCompass = (): QiblaCompassState => {
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState<LocationError | null>(null);
  const [sensorAvailable, setSensorAvailable] = useState(true);
  const [needsCalibration, setNeedsCalibration] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  const dialRotation = useSharedValue(0);
  // A shared value, not state, so the arrow turns green on the UI thread without
  // re-rendering the screen, which made the dial stutter.
  const isAligned = useSharedValue(false);
  const currentRotation = useRef(0);
  const previousHeading = useRef<number | null>(null);
  const qiblaBearingRef = useRef<number | null>(null);
  const alignedRef = useRef(false);
  /** Cached true-vs-magnetic north offset, used to correct magHeading fallbacks. */
  const declination = useRef(0);
  /** Running count of consecutive readings agreeing with the pending calibration state. */
  const calibrationStreak = useRef(0);
  const needsCalibrationRef = useRef(false);

  const showPosition = useCallback(({ lat, lng }: QiblaPosition) => {
    setQiblaBearing(calculateQiblaBearing(lat, lng));
  }, []);

  /**
   * Finds the Qibla bearing. Shows it straight away from the system's last known position,
   * then refines it quietly with a fresh fix, which can take seconds on Android. `isCurrent` returns false once the result is no longer wanted.
   */
  const loadBearing = useCallback(
    async (isCurrent: () => boolean) => {
      try {
        const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
        if (!isCurrent()) return;

        // The compass needs location permission.
        if (status !== 'granted') {
          setLocationError(canAskAgain ? 'can-ask' : 'blocked');
          setIsLoading(false);
          return;
        }
        setLocationGranted(true);
      } catch {
        if (isCurrent()) {
          setLocationError('unavailable');
          setIsLoading(false);
        }
        return;
      }

      // The bearing barely changes with position (50 km is under 1°), so an old one is fine.
      const lastKnown = await Location.getLastKnownPositionAsync().catch(() => null);
      if (!isCurrent()) return;
      const quick = lastKnown
        ? { lat: lastKnown.coords.latitude, lng: lastKnown.coords.longitude }
        : null;
      if (quick) {
        showPosition(quick);
        setLocationError(null);
        setIsLoading(false);
      }

      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!isCurrent()) return;
        const fresh = { lat: position.coords.latitude, lng: position.coords.longitude };
        showPosition(fresh);
        setLocationError(null);
      } catch {
        // Keep showing the quick position if there was one.
        if (isCurrent() && !quick) setLocationError('unavailable');
      }
      if (isCurrent()) setIsLoading(false);
    },
    [showPosition]
  );

  // Smooths a true-north heading and drives the dial and alignment state from it.
  const applyHeading = useCallback(
    (corrected: number) => {
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

      const bearing = qiblaBearingRef.current;
      if (bearing !== null) {
        const aligned = Math.abs(shortestAngleDelta(heading, bearing)) <= ALIGNMENT_TOLERANCE_DEG;
        if (aligned !== alignedRef.current) {
          alignedRef.current = aligned;
          isAligned.value = aligned;
          if (aligned) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          }
        }
      }

      const targetRotation =
        currentRotation.current + shortestAngleDelta(currentRotation.current, -heading);
      currentRotation.current = targetRotation;

      dialRotation.value = withTiming(targetRotation, {
        duration: DIAL_ANIMATION_MS,
        // Linear, so the dial doesn't slow down at the end of each turn and look like it stops.
        easing: Easing.linear,
      });
    },
    [dialRotation, isAligned]
  );

  /** Starts the heading sensors and returns a function that stops them, or null if unavailable. */
  const startHeadingUpdates = useCallback(async (): Promise<(() => void) | null> => {
    // expo-location's Android heading comes from the raw accelerometer and magnetometer
    // and jitters. Android's rotation vector sensor (gyro-fused) is much steadier, so use
    // it when the device has one. iOS's CoreLocation heading is already gyro-fused.
    const useDeviceMotion =
      Platform.OS === 'android' && (await DeviceMotion.isAvailableAsync().catch(() => false));

    let headingSubscription: Location.LocationSubscription;
    try {
      headingSubscription = await Location.watchHeadingAsync((headingData) => {
        // Both the Qibla bearing and the compass must share the true-north frame.
        // When trueHeading is available, cache the device's true-vs-magnetic offset
        // so we can correct magnetic headings (magHeading fallbacks, DeviceMotion).
        let corrected: number;
        if (headingData.trueHeading >= 0) {
          declination.current = shortestAngleDelta(headingData.magHeading, headingData.trueHeading);
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

        if (!useDeviceMotion) applyHeading(corrected);
      });
    } catch {
      setSensorAvailable(false);
      return null;
    }

    if (!useDeviceMotion) return () => headingSubscription.remove();

    DeviceMotion.setUpdateInterval(DEVICE_MOTION_INTERVAL_MS);
    const motionSubscription = DeviceMotion.addListener(({ rotation }) => {
      // Android leaves rotation out until the first rotation vector reading arrives.
      if (!rotation) return;
      applyHeading(
        normalizeDegrees(headingFromRotationAlpha(rotation.alpha) + declination.current)
      );
    });

    return () => {
      headingSubscription.remove();
      motionSubscription.remove();
    };
  }, [applyHeading]);

  const retry = useCallback(async () => {
    setIsLoading(true);
    await loadBearing(() => true);
  }, [loadBearing]);

  // While blocked, the user can only fix it in system settings. Check again when
  // they come back to the app so the compass loads without another tap.
  useEffect(() => {
    if (locationError !== 'blocked') return;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') retry();
    });
    return () => subscription.remove();
  }, [locationError, retry]);

  useEffect(() => {
    qiblaBearingRef.current = qiblaBearing;
  }, [qiblaBearing]);

  useEffect(() => {
    let mounted = true;
    loadBearing(() => mounted);

    return () => {
      mounted = false;
    };
  }, [loadBearing]);

  // Only run the compass sensor while the Qibla screen is focused. Tab screens
  // stay mounted in the background, so without this the heading subscription
  // keeps updating and firing alignment haptics even on other tabs (e.g. Home).
  // Android's heading watcher silently does nothing if location permission isn't
  // granted yet and never retries, so wait for the grant (first launch) to start it.
  useFocusEffect(
    useCallback(() => {
      if (!locationGranted) return;

      let cancelled = false;
      let stopHeadingUpdates: (() => void) | null = null;

      startHeadingUpdates().then((stop) => {
        if (cancelled) {
          stop?.();
          return;
        }
        stopHeadingUpdates = stop;
      });

      return () => {
        cancelled = true;
        stopHeadingUpdates?.();
        previousHeading.current = null;
        alignedRef.current = false;
        isAligned.value = false;
      };
    }, [startHeadingUpdates, locationGranted, isAligned])
  );

  const bearingLabel =
    qiblaBearing !== null ? `${Math.round(qiblaBearing)}° ${getBearingCardinal(qiblaBearing)}` : '';

  return {
    qiblaBearing,
    dialRotation,
    isLoading,
    locationError,
    sensorAvailable,
    retry,
    bearingLabel,
    isAligned,
    needsCalibration,
  };
};

export default useQiblaCompass;
