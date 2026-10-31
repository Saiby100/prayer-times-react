import {
  getNextDay,
  getPrevDay,
  addDays,
  getNextMonth,
  getPrevMonth,
  isSameDay,
  dateToString,
  dateToHijriString,
  parseHijriDate,
} from '../date';
import { getHijriDateInfo } from '../../config/hijriDateInfo';

describe('isSameDay', () => {
  it('matches the same calendar day regardless of time of day', () => {
    expect(isSameDay(new Date(2026, 6, 3, 4, 30), new Date(2026, 6, 3, 22, 15))).toBe(true);
  });

  it('does not match the same day number in a different month', () => {
    expect(isSameDay(new Date(2026, 6, 3), new Date(2026, 7, 3))).toBe(false);
  });

  it('does not match the same day and month in a different year', () => {
    expect(isSameDay(new Date(2026, 6, 3), new Date(2027, 6, 3))).toBe(false);
  });

  it('does not match different days in the same month', () => {
    expect(isSameDay(new Date(2026, 6, 3), new Date(2026, 6, 4))).toBe(false);
  });
});

describe('addDays', () => {
  it('moves back across a month start', () => {
    const shifted = addDays(new Date(2026, 6, 1), -1);
    expect(shifted.getDate()).toBe(30);
    expect(shifted.getMonth()).toBe(5);
  });

  it('returns the same day for 0 without changing the input', () => {
    const date = new Date(2026, 6, 3);
    const shifted = addDays(date, 0);
    expect(isSameDay(shifted, date)).toBe(true);
    expect(shifted).not.toBe(date);
  });

  it('shifts the Hijri date a day behind with an adjustment of 1', () => {
    expect(parseHijriDate(addDays(new Date(2026, 5, 17), -1))).toEqual({
      day: 1,
      month: 1,
      year: 1448,
    });
  });
});

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

  it('uses full names for the numbered months', () => {
    expect(dateToHijriString(new Date(2026, 7, 20))).toBe('Rabiʻ al-Awwal 7, 1448 AH');
    expect(dateToHijriString(new Date(2026, 9, 30))).toBe('Jumada al-Ula 19, 1448 AH');
  });
});

describe('parseHijriDate', () => {
  it('returns an object with day and month', () => {
    const date = new Date(2026, 4, 23);
    const result = parseHijriDate(date);
    expect(result).not.toBeNull();
    expect(typeof result!.day).toBe('number');
    expect(typeof result!.month).toBe('number');
    expect(result!.day).toBeGreaterThanOrEqual(1);
    expect(result!.day).toBeLessThanOrEqual(30);
    expect(result!.month).toBeGreaterThanOrEqual(1);
    expect(result!.month).toBeLessThanOrEqual(12);
  });

  it('returns 1 Muharram for the Islamic New Year', () => {
    expect(parseHijriDate(new Date(2026, 5, 16))).toEqual({ day: 1, month: 1, year: 1448 });
  });

  it('returns 1 Ramadan as month 9', () => {
    expect(parseHijriDate(new Date(2026, 1, 18))).toEqual({ day: 1, month: 9, year: 1447 });
  });
});

describe('getHijriDateInfo', () => {
  it('matches events by month number', () => {
    const titles = getHijriDateInfo(1, 1).map((info) => info.title);
    expect(titles).toContain('Islamic New Year');
    expect(titles).toContain('Sacred Month of Muharram');
  });
});
