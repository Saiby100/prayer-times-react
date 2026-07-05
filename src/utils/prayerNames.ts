const PRAYER_DISPLAY_NAMES: Record<string, string> = {
  fajr: 'Fajr',
  dhuhr: 'Thur',
  asrShafii: 'Asr(S)',
  asrHanafi: 'Asr(H)',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

const DISPLAY_TO_DB: Record<string, string> = Object.fromEntries(
  Object.entries(PRAYER_DISPLAY_NAMES).map(([db, display]) => [display, db])
);

export function toDisplayNames(times: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(times)) {
    const displayName = PRAYER_DISPLAY_NAMES[key] ?? key;
    result[displayName] = value;
  }
  return result;
}

export function fromDisplayNames(times: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(times)) {
    const dbName = DISPLAY_TO_DB[key] ?? key;
    result[dbName] = value;
  }
  return result;
}
