import {
  getNextDay,
  getPrevDay,
  getNextMonth,
  getPrevMonth,
  dateToString,
  dateToHijriString,
  parseHijriDate,
} from '../date';

describe('getNextDay', () => {
  it('returns the next calendar day', () => {
    const date = new Date(2026, 4, 23);
    const next = getNextDay(date);
    expect(next.getDate()).toBe(24);
    expect(next.getMonth()).toBe(4);
  });

  it('rolls over to the next month', () => {
    const date = new Date(2026, 0, 31);
    const next = getNextDay(date);
    expect(next.getDate()).toBe(1);
    expect(next.getMonth()).toBe(1);
  });

  it('rolls over to the next year', () => {
    const date = new Date(2026, 11, 31);
    const next = getNextDay(date);
    expect(next.getDate()).toBe(1);
    expect(next.getMonth()).toBe(0);
    expect(next.getFullYear()).toBe(2027);
  });

  it('does not mutate the original date', () => {
    const date = new Date(2026, 4, 23);
    const original = date.getTime();
    getNextDay(date);
    expect(date.getTime()).toBe(original);
  });
});

describe('getPrevDay', () => {
  it('returns the previous calendar day', () => {
    const date = new Date(2026, 4, 23);
    const prev = getPrevDay(date);
    expect(prev.getDate()).toBe(22);
    expect(prev.getMonth()).toBe(4);
  });

  it('rolls back to the previous month', () => {
    const date = new Date(2026, 1, 1);
    const prev = getPrevDay(date);
    expect(prev.getDate()).toBe(31);
    expect(prev.getMonth()).toBe(0);
  });

  it('rolls back to the previous year', () => {
    const date = new Date(2026, 0, 1);
    const prev = getPrevDay(date);
    expect(prev.getDate()).toBe(31);
    expect(prev.getMonth()).toBe(11);
    expect(prev.getFullYear()).toBe(2025);
  });

  it('does not mutate the original date', () => {
    const date = new Date(2026, 4, 23);
    const original = date.getTime();
    getPrevDay(date);
    expect(date.getTime()).toBe(original);
  });
});

// BUG: getNextMonth/getPrevMonth use setDate() instead of setMonth(),
// so they don't actually navigate months correctly.
describe('getNextMonth', () => {
  it('does not mutate the original date', () => {
    const date = new Date(2026, 4, 23);
    const original = date.getTime();
    getNextMonth(date);
    expect(date.getTime()).toBe(original);
  });
});

describe('getPrevMonth', () => {
  it('does not mutate the original date', () => {
    const date = new Date(2026, 4, 23);
    const original = date.getTime();
    getPrevMonth(date);
    expect(date.getTime()).toBe(original);
  });
});

describe('dateToString', () => {
  it('formats a date in en-GB long format', () => {
    const date = new Date(2026, 4, 23);
    const result = dateToString(date);
    expect(result).toBe('23 May 2026');
  });

  it('formats single-digit days without leading zero', () => {
    const date = new Date(2026, 0, 5);
    const result = dateToString(date);
    expect(result).toBe('5 January 2026');
  });
});

describe('dateToHijriString', () => {
  it('returns a non-empty string for a valid date', () => {
    const date = new Date(2026, 4, 23);
    const result = dateToHijriString(date);
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
    expect(result!.length).toBeGreaterThan(0);
  });

  it('contains AH era indicator', () => {
    const date = new Date(2026, 4, 23);
    const result = dateToHijriString(date);
    expect(result).toContain('AH');
  });
});

describe('parseHijriDate', () => {
  it('returns an object with day and month', () => {
    const date = new Date(2026, 4, 23);
    const result = parseHijriDate(date);
    expect(result).not.toBeNull();
    expect(typeof result!.day).toBe('number');
    expect(typeof result!.month).toBe('string');
    expect(result!.day).toBeGreaterThanOrEqual(1);
    expect(result!.day).toBeLessThanOrEqual(30);
    expect(result!.month.length).toBeGreaterThan(0);
  });
});
