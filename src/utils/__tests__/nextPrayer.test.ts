import { getNextPrayer } from '../nextPrayer';

const today = {
  Fajr: '05:10',
  Sunrise: '06:30',
  Dhuhr: '12:40',
  Asr: '15:50',
  Maghrib: '18:20',
  Isha: '19:40',
};
const tomorrow = {
  Fajr: '05:11',
  Sunrise: '06:31',
  Dhuhr: '12:40',
  Asr: '15:49',
  Maghrib: '18:18',
  Isha: '19:38',
};

const at = (day: number, hours: number, minutes: number) => new Date(2026, 9, day, hours, minutes);

describe('getNextPrayer', () => {
  it('picks the next prayer left today', () => {
    expect(getNextPrayer(today, tomorrow, [], at(14, 13, 0))).toEqual({
      name: 'Asr',
      date: at(14, 15, 50),
    });
  });

  it('counts a prayer starting right now as next', () => {
    expect(getNextPrayer(today, tomorrow, [], at(14, 12, 40))?.name).toBe('Dhuhr');
  });

  it("picks tomorrow's Fajr after Isha", () => {
    expect(getNextPrayer(today, tomorrow, [], at(14, 22, 0))).toEqual({
      name: 'Fajr',
      date: at(15, 5, 11),
    });
  });

  it('rolls into the next month', () => {
    expect(getNextPrayer(today, tomorrow, [], new Date(2026, 9, 31, 22, 0))?.date).toEqual(
      new Date(2026, 10, 1, 5, 11)
    );
  });

  it('skips hidden prayers', () => {
    expect(getNextPrayer(today, tomorrow, ['Asr'], at(14, 13, 0))?.name).toBe('Maghrib');
    expect(getNextPrayer(today, tomorrow, ['Fajr'], at(14, 22, 0))?.name).toBe('Sunrise');
  });

  it('moves to tomorrow after Maghrib when Isha is hidden', () => {
    expect(getNextPrayer(today, tomorrow, ['Isha'], at(14, 19, 0))?.date).toEqual(at(15, 5, 11));
  });

  it("returns null after Isha when tomorrow's times are unknown", () => {
    expect(getNextPrayer(today, null, [], at(14, 22, 0))).toBeNull();
  });
});
