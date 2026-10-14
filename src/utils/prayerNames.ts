type PrayerInfo = {
  /** Name shown in the app. Hidden prayers are stored by this, so don't change it without a migration. */
  label: string;
  /** Feather icon name shown next to the prayer. */
  icon: string;
};

/** Label and icon per prayer, keyed by the DB key in `prayer_times.times`. */
const PRAYERS: Record<string, PrayerInfo> = {
  fajr: { label: 'Fajr', icon: 'sunrise' },
  dhuhr: { label: 'Thur', icon: 'sun' },
  asrShafii: { label: 'Asr(S)', icon: 'cloud' },
  asrHanafi: { label: 'Asr(H)', icon: 'cloud' },
  maghrib: { label: 'Maghrib', icon: 'sunset' },
  isha: { label: 'Isha', icon: 'moon' },
};

const FALLBACK_ICON = 'clock';

const DISPLAY_TO_DB: Record<string, string> = Object.fromEntries(
  Object.entries(PRAYERS).map(([db, { label }]) => [label, db])
);

const ICON_BY_LABEL: Record<string, string> = Object.fromEntries(
  Object.values(PRAYERS).map(({ label, icon }) => [label, icon])
);

export function getPrayerIcon(label: string): string {
  return ICON_BY_LABEL[label] ?? FALLBACK_ICON;
}

export function toDisplayNames(times: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(times)) {
    const displayName = PRAYERS[key]?.label ?? key;
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
