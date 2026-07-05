const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const toRadians = (degrees: number) => degrees * (Math.PI / 180);
const toDegrees = (radians: number) => radians * (180 / Math.PI);

const calculateQiblaBearing = (userLat: number, userLng: number): number => {
  const lat1 = toRadians(userLat);
  const lat2 = toRadians(KAABA_LAT);
  const deltaLng = toRadians(KAABA_LNG - userLng);

  const x = Math.sin(deltaLng) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  const bearing = toDegrees(Math.atan2(x, y));
  return (bearing + 360) % 360;
};

const getBearingCardinal = (bearing: number): string => {
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return cardinals[index];
};

/** Wrap an angle in degrees into the [0, 360) range. */
const normalizeDegrees = (degrees: number): number => ((degrees % 360) + 360) % 360;

/**
 * Signed shortest angular distance from `from` to `to` in degrees, in [-180, 180).
 * Positive means clockwise.
 */
const shortestAngleDelta = (from: number, to: number): number => ((to - from + 540) % 360) - 180;

/**
 * Exponential low-pass filter for a compass heading, handling the 0/360 wrap.
 * Returns the smoothed heading in [0, 360). `alpha` in (0, 1] — higher is more
 * responsive, lower is smoother.
 */
const smoothHeading = (previous: number, next: number, alpha: number): number =>
  normalizeDegrees(previous + alpha * shortestAngleDelta(previous, next));

/** Below this angular change (degrees) a reading is treated as noise and ignored. */
const HEADING_DEADZONE_DEG = 1.5;
/** Smoothing factor applied just above the dead-zone (heavy damping). */
const HEADING_MIN_ALPHA = 0.06;
/** Smoothing factor applied for large, intentional turns (responsive). */
const HEADING_MAX_ALPHA = 0.5;
/** Angular change (degrees) at which smoothing reaches HEADING_MAX_ALPHA. */
const HEADING_RESPONSIVE_RANGE_DEG = 25;

/**
 * Picks a low-pass smoothing factor based on how far the new reading is from the
 * current heading. Tiny changes (jitter) return 0 so the needle holds steady;
 * larger changes (real turns) scale up toward a responsive alpha. `delta` is the
 * signed shortest angular distance in degrees.
 */
const adaptiveSmoothingAlpha = (delta: number): number => {
  const magnitude = Math.abs(delta);
  if (magnitude <= HEADING_DEADZONE_DEG) return 0;
  const t = Math.min((magnitude - HEADING_DEADZONE_DEG) / HEADING_RESPONSIVE_RANGE_DEG, 1);
  return HEADING_MIN_ALPHA + (HEADING_MAX_ALPHA - HEADING_MIN_ALPHA) * t;
};

/**
 * Whether a `watchHeadingAsync` accuracy reading indicates the magnetometer needs
 * calibration. iOS reports heading uncertainty in degrees (lower is better);
 * Android reports a sensor accuracy level 0-3 (higher is better).
 */
const isHeadingAccuracyPoor = (accuracy: number, os: 'ios' | 'android' | string): boolean => {
  if (os === 'android') return accuracy < 2;
  // iOS (and default): uncertainty in degrees; negative means invalid.
  return accuracy < 0 || accuracy > 25;
};

export {
  KAABA_LAT,
  KAABA_LNG,
  calculateQiblaBearing,
  getBearingCardinal,
  normalizeDegrees,
  shortestAngleDelta,
  smoothHeading,
  adaptiveSmoothingAlpha,
  isHeadingAccuracyPoor,
};
