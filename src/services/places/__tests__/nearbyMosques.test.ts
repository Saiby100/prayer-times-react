import { rankMosques, shouldReuseCache } from '../nearbyMosques';
import type { Mosque } from '../types';
import type { MosquesCacheEntry } from '@/stores/mosquesCache';

const mosque = (placeId: string, lat: number, lng: number, distanceKm = 0): Mosque => ({
  placeId,
  name: placeId,
  location: { lat, lng },
  distanceKm,
});

describe('rankMosques', () => {
  // ~0.01 deg latitude ≈ 1.11 km, so these are ordered by latitude from (0,0).
  const near = mosque('near', 0.01, 0, 999); // stale distance to prove recompute
  const mid = mosque('mid', 0.02, 0);
  const far = mosque('far', 0.03, 0);

  it('sorts by recomputed distance from the given point', () => {
    const ranked = rankMosques([far, near, mid], 0, 0);
    expect(ranked.map((m) => m.placeId)).toEqual(['near', 'mid', 'far']);
  });

  it('overwrites the stale distanceKm with the recomputed value', () => {
    const [first] = rankMosques([near], 0, 0);
    expect(first.distanceKm).toBeCloseTo(1.11, 1);
  });

  it('caps the result to the given limit', () => {
    const ranked = rankMosques([far, near, mid], 0, 0, 2);
    expect(ranked.map((m) => m.placeId)).toEqual(['near', 'mid']);
  });

  it('returns all results when no limit is given', () => {
    expect(rankMosques([far, near, mid], 0, 0)).toHaveLength(3);
  });
});

describe('shouldReuseCache', () => {
  const entry: MosquesCacheEntry = {
    mosques: [mosque('a', 0.01, 0)],
    fetchCenter: { lat: 0, lng: 0 },
    fetchedDate: '2026-06-06',
  };

  it('returns false when there is no cache entry', () => {
    expect(shouldReuseCache(null, 0, 0, '2026-06-06', 2)).toBe(false);
  });

  it('returns false when the cache is from a different day', () => {
    expect(shouldReuseCache(entry, 0, 0, '2026-06-07', 2)).toBe(false);
  });

  it('returns true when same day and within the margin', () => {
    // ~1.11 km < 2 km margin
    expect(shouldReuseCache(entry, 0.01, 0, '2026-06-06', 2)).toBe(true);
  });

  it('returns false when same day but beyond the margin', () => {
    // ~3.33 km > 2 km margin
    expect(shouldReuseCache(entry, 0.03, 0, '2026-06-06', 2)).toBe(false);
  });
});
