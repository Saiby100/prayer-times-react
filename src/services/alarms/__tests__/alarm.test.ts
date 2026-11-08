const mockNative = {
  schedule: jest.fn(async () => {}),
  cancel: jest.fn(async () => {}),
  list: jest.fn(async () => [] as unknown[]),
};
let mockAvailable = true;

jest.mock('expo', () => ({
  requireOptionalNativeModule: () => (mockAvailable ? mockNative : null),
}));

type AlarmModule = typeof import('../alarm');

function loadAlarm(available: boolean): AlarmModule {
  mockAvailable = available;
  let mod: AlarmModule | undefined;
  jest.isolateModules(() => {
    // A fresh copy per mock setup, since the native module is looked up at import time.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require('../alarm');
  });
  return mod!;
}

const alarm = {
  id: 'prayer_reminder:2026-11-08:Fajr',
  fireAt: new Date('2026-11-08T03:07:00Z'),
  prayer: 'Fajr',
  prayerTime: '05:12',
  title: 'Fajr Reminder',
  body: 'Fajr prayer at 05:12.',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('with the native module', () => {
  const { alarmsAvailable, scheduleAlarm, cancelAlarms, getScheduledAlarms } = loadAlarm(true);

  it('reports alarms as available', () => {
    expect(alarmsAvailable()).toBe(true);
  });

  it('passes the fire time to native code in ms and returns the id', async () => {
    await expect(scheduleAlarm(alarm)).resolves.toBe(alarm.id);
    expect(mockNative.schedule).toHaveBeenCalledWith({
      ...alarm,
      fireAt: alarm.fireAt.getTime(),
    });
  });

  it('cancels the given ids', async () => {
    await cancelAlarms(['a', 'b']);
    expect(mockNative.cancel).toHaveBeenCalledWith(['a', 'b']);
  });

  it('skips the native call when there is nothing to cancel', async () => {
    await cancelAlarms([]);
    expect(mockNative.cancel).not.toHaveBeenCalled();
  });

  it('returns the scheduled alarms from native code', async () => {
    const scheduled = [{ ...alarm, fireAt: alarm.fireAt.getTime() }];
    mockNative.list.mockResolvedValueOnce(scheduled);
    await expect(getScheduledAlarms()).resolves.toEqual(scheduled);
  });

  it('rejects when native scheduling fails', async () => {
    mockNative.schedule.mockRejectedValueOnce(new Error('not allowed'));
    await expect(scheduleAlarm(alarm)).rejects.toThrow('not allowed');
  });
});

describe('without the native module (iOS, web, older builds)', () => {
  const { alarmsAvailable, scheduleAlarm, cancelAlarms, getScheduledAlarms } = loadAlarm(false);

  it('does nothing', async () => {
    expect(alarmsAvailable()).toBe(false);
    await expect(scheduleAlarm(alarm)).resolves.toBeNull();
    await expect(cancelAlarms(['a'])).resolves.toBeUndefined();
    await expect(getScheduledAlarms()).resolves.toEqual([]);
    expect(mockNative.schedule).not.toHaveBeenCalled();
    expect(mockNative.cancel).not.toHaveBeenCalled();
    expect(mockNative.list).not.toHaveBeenCalled();
  });
});
