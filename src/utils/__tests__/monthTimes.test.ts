import { dayKey, getTimesForDay, monthRange } from '../monthTimes';

describe('dayKey', () => {
  it('pads month and day', () => {
    expect(dayKey(new Date(2027, 0, 5))).toBe('01-05');
    expect(dayKey(new Date(2026, 9, 31))).toBe('10-31');
  });

  it('uses the local calendar day at midnight', () => {
    expect(dayKey(new Date(2026, 9, 1, 0, 0))).toBe('10-01');
  });
});

describe('monthRange', () => {
  it('covers the whole month in 2026', () => {
    expect(monthRange(9)).toEqual(['2026-10-01', '2026-10-31']);
    expect(monthRange(0)).toEqual(['2026-01-01', '2026-01-31']);
    expect(monthRange(11)).toEqual(['2026-12-01', '2026-12-31']);
  });

  it('ends February on the 28th', () => {
    expect(monthRange(1)).toEqual(['2026-02-01', '2026-02-28']);
  });
});

describe('getTimesForDay', () => {
  const feb = {
    '02-27': { Fajr: '05:01' },
    '02-28': { Fajr: '05:02' },
  };

  it('finds the day by key, ignoring year', () => {
    expect(getTimesForDay(feb, new Date(2027, 1, 27))).toEqual({ Fajr: '05:01' });
  });

  it('falls back to 28 Feb on a leap day', () => {
    expect(getTimesForDay(feb, new Date(2028, 1, 29))).toEqual({ Fajr: '05:02' });
  });

  it('returns undefined for a missing day', () => {
    expect(getTimesForDay(feb, new Date(2026, 1, 26))).toBeUndefined();
  });
});
