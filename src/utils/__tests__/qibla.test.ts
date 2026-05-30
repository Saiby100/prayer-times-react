import { KAABA_LAT, KAABA_LNG, calculateQiblaBearing, getBearingCardinal } from '../qibla';

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
