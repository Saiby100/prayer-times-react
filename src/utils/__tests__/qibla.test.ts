import {
  KAABA_LAT,
  KAABA_LNG,
  adaptiveSmoothingAlpha,
  calculateQiblaBearing,
  getBearingCardinal,
  isHeadingAccuracyPoor,
  normalizeDegrees,
  shortestAngleDelta,
  smoothHeading,
} from '../qibla';

describe('constants', () => {
  it('has correct Kaaba coordinates', () => {
    expect(KAABA_LAT).toBeCloseTo(21.4225, 4);
    expect(KAABA_LNG).toBeCloseTo(39.8262, 4);
  });
});

describe('calculateQiblaBearing', () => {
  it('returns 0 for a point directly south of the Kaaba on the same longitude', () => {
    const bearing = calculateQiblaBearing(-10, KAABA_LNG);
    expect(bearing).toBeCloseTo(0, 0);
  });

  it('returns ~23° from Cape Town, South Africa', () => {
    const bearing = calculateQiblaBearing(-33.9249, 18.4241);
    expect(bearing).toBeCloseTo(23.35, 0);
  });

  it('returns a bearing between 0 and 360', () => {
    const locations = [
      [40.7128, -74.006],
      [35.6762, 139.6503],
      [-33.8688, 151.2093],
      [51.5074, -0.1278],
    ];
    for (const [lat, lng] of locations) {
      const bearing = calculateQiblaBearing(lat, lng);
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    }
  });

  it('returns 0 when standing at the Kaaba', () => {
    const bearing = calculateQiblaBearing(KAABA_LAT, KAABA_LNG);
    expect(bearing).toBeCloseTo(0, 5);
  });
});

describe('getBearingCardinal', () => {
  it.each([
    [0, 'N'],
    [45, 'NE'],
    [90, 'E'],
    [135, 'SE'],
    [180, 'S'],
    [225, 'SW'],
    [270, 'W'],
    [315, 'NW'],
  ])('returns %s for bearing %d', (bearing, expected) => {
    expect(getBearingCardinal(bearing)).toBe(expected);
  });

  it('rounds to nearest cardinal', () => {
    expect(getBearingCardinal(22)).toBe('N');
    expect(getBearingCardinal(23)).toBe('NE');
    expect(getBearingCardinal(350)).toBe('N');
  });

  it('handles 360 as N', () => {
    expect(getBearingCardinal(360)).toBe('N');
  });
});

describe('normalizeDegrees', () => {
  it.each([
    [0, 0],
    [360, 0],
    [370, 10],
    [-10, 350],
    [-370, 350],
    [720, 0],
  ])('wraps %d to %d', (input, expected) => {
    expect(normalizeDegrees(input)).toBeCloseTo(expected, 6);
  });
});

describe('shortestAngleDelta', () => {
  it('returns the signed shortest path across the 0/360 wrap', () => {
    expect(shortestAngleDelta(350, 10)).toBeCloseTo(20, 6);
    expect(shortestAngleDelta(10, 350)).toBeCloseTo(-20, 6);
    expect(shortestAngleDelta(0, 90)).toBeCloseTo(90, 6);
    // 180 is antipodal; -180 is the equivalent representative in [-180, 180).
    expect(Math.abs(shortestAngleDelta(0, 180))).toBeCloseTo(180, 6);
  });
});

describe('smoothHeading', () => {
  it('moves partway toward the target, handling the wrap', () => {
    // Halfway from 350 to 10 (delta +20) => 350 + 10 = 360 => 0
    expect(smoothHeading(350, 10, 0.5)).toBeCloseTo(0, 6);
  });

  it('stays within [0, 360)', () => {
    const result = smoothHeading(355, 5, 1);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(360);
    expect(result).toBeCloseTo(5, 6);
  });
});

describe('adaptiveSmoothingAlpha', () => {
  it('returns 0 inside the dead-zone so jitter is dropped', () => {
    expect(adaptiveSmoothingAlpha(0)).toBe(0);
    expect(adaptiveSmoothingAlpha(1)).toBe(0);
    expect(adaptiveSmoothingAlpha(-1.5)).toBe(0);
  });

  it('applies light smoothing just above the dead-zone', () => {
    const alpha = adaptiveSmoothingAlpha(3);
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(0.15);
  });

  it('ramps up to a responsive alpha for large turns and caps there', () => {
    expect(adaptiveSmoothingAlpha(90)).toBeCloseTo(0.5, 6);
    expect(adaptiveSmoothingAlpha(-180)).toBeCloseTo(0.5, 6);
  });

  it('is symmetric in sign', () => {
    expect(adaptiveSmoothingAlpha(10)).toBeCloseTo(adaptiveSmoothingAlpha(-10), 6);
  });
});

describe('isHeadingAccuracyPoor', () => {
  it('treats Android sensor level below 2 as poor', () => {
    expect(isHeadingAccuracyPoor(0, 'android')).toBe(true);
    expect(isHeadingAccuracyPoor(1, 'android')).toBe(true);
    expect(isHeadingAccuracyPoor(2, 'android')).toBe(false);
    expect(isHeadingAccuracyPoor(3, 'android')).toBe(false);
  });

  it('treats large or negative iOS uncertainty as poor', () => {
    expect(isHeadingAccuracyPoor(-1, 'ios')).toBe(true);
    expect(isHeadingAccuracyPoor(30, 'ios')).toBe(true);
    expect(isHeadingAccuracyPoor(15, 'ios')).toBe(false);
    expect(isHeadingAccuracyPoor(0, 'ios')).toBe(false);
  });
});
