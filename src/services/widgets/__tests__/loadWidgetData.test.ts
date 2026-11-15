import { loadWidgetData } from '../loadWidgetData';

let mockArea: string | undefined = 'Colombo';
const mockLoadMonth = jest.fn();

jest.mock('@/stores', () => ({
  getArea: () => mockArea,
  getDisabledPrayers: () => [],
}));

jest.mock('@/services/prayerTimes', () => ({
  loadMonth: (date: Date, area: string) => mockLoadMonth(date, area),
}));

const october = {
  '10-31': { Fajr: '05:05', Thur: '12:00', 'Asr(S)': '15:30', Maghrib: '18:00', Isha: '19:05' },
};

describe('loadWidgetData', () => {
  beforeEach(() => {
    mockArea = 'Colombo';
    mockLoadMonth.mockReset();
  });

  it("is not loaded after Isha on a month's last day when next month can't be fetched", async () => {
    mockLoadMonth.mockImplementation(async (date: Date) =>
      date.getMonth() === 9 ? october : null
    );

    const data = await loadWidgetData(new Date(2026, 9, 31, 21, 0));

    expect(data).toEqual({ state: 'not-loaded', area: 'Colombo' });
    expect(mockLoadMonth).toHaveBeenCalledTimes(2);
    expect(mockLoadMonth.mock.calls[1][0].getMonth()).toBe(10);
  });

  it("doesn't load next month while a prayer is left today", async () => {
    mockLoadMonth.mockResolvedValue(october);

    const data = await loadWidgetData(new Date(2026, 9, 31, 14, 0));

    expect(data.state).toBe('ready');
    expect(mockLoadMonth).toHaveBeenCalledTimes(1);
  });

  it('loads nothing when no area is picked', async () => {
    mockArea = undefined;

    expect(await loadWidgetData()).toEqual({ state: 'no-area' });
    expect(mockLoadMonth).not.toHaveBeenCalled();
  });
});
