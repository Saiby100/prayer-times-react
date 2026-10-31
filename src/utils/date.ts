function getNextDay(current: Date) {
  const nextDay = new Date(current);

  nextDay.setDate(current.getDate() + 1);

  return nextDay;
}

function getPrevDay(current: Date) {
  const prevDay = new Date(current);

  prevDay.setDate(current.getDate() - 1);

  return prevDay;
}

function addDays(current: Date, days: number) {
  const result = new Date(current);

  result.setDate(current.getDate() + days);

  return result;
}

function getNextMonth(current: Date) {
  const nextMonth = new Date(current);

  nextMonth.setDate(current.getMonth() + 1);

  if (nextMonth.getMonth() === 0) {
    nextMonth.setFullYear(current.getFullYear() + 1);
  }

  return nextMonth;
}

function getPrevMonth(current: Date) {
  const prevMonth = new Date(current);

  prevMonth.setDate(current.getMonth() - 1);

  if (prevMonth.getMonth() === 11) {
    prevMonth.setFullYear(current.getFullYear() - 1);
  }

  return prevMonth;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function dateToString(current: Date) {
  return current.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** English Hijri month names, indexed by month number − 1 (CLDR uses "Jumada I" etc.). */
const HIJRI_MONTH_NAMES = [
  'Muharram',
  'Safar',
  'Rabiʻ al-Awwal',
  'Rabiʻ al-Thani',
  'Jumada al-Ula',
  'Jumada al-Akhirah',
  'Rajab',
  'Shaʻban',
  'Ramadan',
  'Shawwal',
  'Dhuʻl-Qiʻdah',
  'Dhuʻl-Hijjah',
];

/** Umm al-Qura formatter, built once; null if this Intl build lacks the calendar. */
const hijriFormatter = (() => {
  try {
    return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // UTC so the device's time zone (fixed when the formatter is built) can't shift the day.
      timeZone: 'UTC',
    });
  } catch {
    return null;
  }
})();

type ParsedHijriDate = {
  /** Day of the Hijri month. */
  day: number;
  /** Hijri month number (1 = Muharram … 12 = Dhuʻl-Hijjah). */
  month: number;
  /** Hijri year (AH). */
  year: number;
};

function parseHijriDate(date: Date): ParsedHijriDate | null {
  try {
    // The local calendar day at noon UTC, so formatting in UTC gives the same day.
    const utcDay = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12));
    const parts = hijriFormatter?.formatToParts(utcDay);
    if (!parts) return null;
    const read = (type: Intl.DateTimeFormatPartTypes) =>
      parseInt(parts.find((p) => p.type === type)?.value ?? '', 10);
    const day = read('day');
    const month = read('month');
    const year = read('year');
    if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null;
    return { day, month, year };
  } catch {
    return null;
  }
}

function dateToHijriString(current: Date): string | null {
  const parsed = parseHijriDate(current);
  if (!parsed) return null;
  return `${HIJRI_MONTH_NAMES[parsed.month - 1]} ${parsed.day}, ${parsed.year} AH`;
}

export {
  getNextDay,
  getPrevDay,
  addDays,
  getNextMonth,
  getPrevMonth,
  isSameDay,
  dateToString,
  dateToHijriString,
  parseHijriDate,
};
export type { ParsedHijriDate };
