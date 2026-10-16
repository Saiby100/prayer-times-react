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

function dateToHijriString(current: Date): string | null {
  try {
    return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(current);
  } catch {
    return null;
  }
}

type ParsedHijriDate = {
  /** Day of the Hijri month. */
  day: number;
  /** Hijri month number (1 = Muharram … 12 = Dhuʻl-Hijjah). */
  month: number;
};

function parseHijriDate(date: Date): ParsedHijriDate | null {
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    const day = parseInt(parts.find((p) => p.type === 'day')?.value ?? '', 10);
    const month = parseInt(parts.find((p) => p.type === 'month')?.value ?? '', 10);
    if (Number.isNaN(day) || Number.isNaN(month)) return null;
    return { day, month };
  } catch {
    return null;
  }
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
