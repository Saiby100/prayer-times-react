import { fromDisplayNames, getPrayerIcon, toDisplayNames } from '../prayerNames';

const DB_TIMES = {
  fajr: '05:00',
  dhuhr: '12:30',
  asrShafii: '15:45',
  asrHanafi: '16:30',
  maghrib: '18:10',
  isha: '19:30',
};

describe('toDisplayNames', () => {
  it('maps DB keys to labels', () => {
    expect(toDisplayNames(DB_TIMES)).toEqual({
      Fajr: '05:00',
      Thur: '12:30',
      'Asr(S)': '15:45',
      'Asr(H)': '16:30',
      Maghrib: '18:10',
      Isha: '19:30',
    });
  });

  it('keeps unknown keys as they are', () => {
    expect(toDisplayNames({ sunrise: '06:20' })).toEqual({ sunrise: '06:20' });
  });
});

describe('fromDisplayNames', () => {
  it('reverses toDisplayNames', () => {
    expect(fromDisplayNames(toDisplayNames(DB_TIMES))).toEqual(DB_TIMES);
  });
});

describe('getPrayerIcon', () => {
  it.each([
    ['Fajr', 'sunrise'],
    ['Thur', 'sun'],
    ['Asr(S)', 'cloud'],
    ['Asr(H)', 'cloud'],
    ['Maghrib', 'sunset'],
    ['Isha', 'moon'],
  ])('%s shows %s', (label, icon) => {
    expect(getPrayerIcon(label)).toBe(icon);
  });

  it('falls back to clock for unknown labels', () => {
    expect(getPrayerIcon('sunrise')).toBe('clock');
  });
});
