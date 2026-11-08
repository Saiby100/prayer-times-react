import { buildWidgetData, type WidgetDataInput } from '../widgetData';

const day = (fajr: string, isha: string) => ({
  Fajr: fajr,
  Thur: '12:05',
  'Asr(S)': '15:42',
  Maghrib: '18:03',
  Isha: isha,
});

const october = {
  '10-14': day('04:58', '19:14'),
  '10-15': day('04:59', '19:13'),
  '10-31': day('05:05', '19:05'),
};
const november = { '11-01': day('05:06', '19:04') };

const at = (month: number, date: number, hours: number, minutes: number) =>
  new Date(2026, month, date, hours, minutes);

const input = (overrides: Partial<WidgetDataInput>): WidgetDataInput => ({
  area: 'Colombo',
  hidden: [],
  now: at(9, 14, 14, 0),
  todayMonth: october,
  tomorrowMonth: october,
  ...overrides,
});

describe('buildWidgetData', () => {
  it("shows today's next prayer and today's rows mid-day", () => {
    const data = buildWidgetData(input({}));

    expect(data).toEqual({
      state: 'ready',
      area: 'Colombo',
      day: new Date(2026, 9, 14),
      rows: [
        { name: 'Fajr', time: '04:58' },
        { name: 'Thur', time: '12:05' },
        { name: 'Asr(S)', time: '15:42' },
        { name: 'Maghrib', time: '18:03' },
        { name: 'Isha', time: '19:14' },
      ],
      next: { name: 'Asr(S)', date: at(9, 14, 15, 42) },
    });
  });

  it("shows tomorrow's rows with Fajr next after Isha", () => {
    const data = buildWidgetData(input({ now: at(9, 14, 21, 0) }));

    expect(data.state).toBe('ready');
    if (data.state !== 'ready') return;
    expect(data.day).toEqual(new Date(2026, 9, 15));
    expect(data.next).toEqual({ name: 'Fajr', date: at(9, 15, 4, 59) });
    expect(data.rows[0]).toEqual({ name: 'Fajr', time: '04:59' });
    expect(data.rows.at(-1)).toEqual({ name: 'Isha', time: '19:13' });
  });

  it('skips a hidden prayer as next and leaves it out of the rows', () => {
    const data = buildWidgetData(input({ hidden: ['Asr(S)'] }));

    expect(data.state).toBe('ready');
    if (data.state !== 'ready') return;
    expect(data.next.name).toBe('Maghrib');
    expect(data.rows.map((r) => r.name)).toEqual(['Fajr', 'Thur', 'Maghrib', 'Isha']);
  });

  it('moves to tomorrow once the last visible prayer has passed', () => {
    const data = buildWidgetData(input({ hidden: ['Isha'], now: at(9, 14, 18, 30) }));

    expect(data.state).toBe('ready');
    if (data.state !== 'ready') return;
    expect(data.next).toEqual({ name: 'Fajr', date: at(9, 15, 4, 59) });
    expect(data.rows.map((r) => r.name)).not.toContain('Isha');
  });

  it('shows "all hidden" when every prayer is hidden', () => {
    const hidden = ['Fajr', 'Thur', 'Asr(S)', 'Maghrib', 'Isha'];

    expect(buildWidgetData(input({ hidden }))).toEqual({ state: 'all-hidden', area: 'Colombo' });
  });

  it('asks to choose an area when none is picked', () => {
    expect(buildWidgetData(input({ area: undefined }))).toEqual({ state: 'no-area' });
  });

  it("is not loaded when today's month is missing", () => {
    const data = buildWidgetData(input({ todayMonth: null, tomorrowMonth: null }));

    expect(data).toEqual({ state: 'not-loaded', area: 'Colombo' });
  });

  it("is not loaded after Isha when tomorrow's month is missing", () => {
    const data = buildWidgetData(input({ now: at(9, 31, 21, 0), tomorrowMonth: null }));

    expect(data).toEqual({ state: 'not-loaded', area: 'Colombo' });
  });

  it("doesn't need tomorrow's month while a prayer is left today", () => {
    const data = buildWidgetData(input({ now: at(9, 31, 14, 0), tomorrowMonth: null }));

    expect(data.state).toBe('ready');
  });

  it("uses next month's times after Isha on a month's last day", () => {
    const data = buildWidgetData(input({ now: at(9, 31, 21, 0), tomorrowMonth: november }));

    expect(data.state).toBe('ready');
    if (data.state !== 'ready') return;
    expect(data.day).toEqual(new Date(2026, 10, 1));
    expect(data.next).toEqual({ name: 'Fajr', date: at(10, 1, 5, 6) });
  });

  it("uses 28 February's times on 29 February", () => {
    const february = { '02-28': day('05:10', '19:20'), '03-01': day('05:09', '19:21') };
    const now = new Date(2028, 1, 29, 14, 0);

    const data = buildWidgetData(input({ now, todayMonth: february, tomorrowMonth: february }));

    expect(data.state).toBe('ready');
    if (data.state !== 'ready') return;
    expect(data.day).toEqual(new Date(2028, 1, 29));
    expect(data.rows[0]).toEqual({ name: 'Fajr', time: '05:10' });
    expect(data.next).toEqual({ name: 'Asr(S)', date: new Date(2028, 1, 29, 15, 42) });
  });
});
