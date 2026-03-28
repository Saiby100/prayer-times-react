import { useMemo } from 'react';

import { dateToHijriString, parseHijriDate } from '@/utils/date';
import { getHijriDateInfo, type HijriDateInfo } from '@/config/hijriDateInfo';

type UseHijriDateResult = {
  /** Formatted Hijri date string, or null if conversion fails. */
  hijriDateString: string | null;
  /** Events and info matching the current Hijri date. */
  hijriDateInfoList: HijriDateInfo[];
};

export default function useHijriDate(date: Date): UseHijriDateResult {
  const hijriDateString = useMemo(() => dateToHijriString(date), [date]);

  const hijriDateInfoList = useMemo(() => {
    const parsed = parseHijriDate(date);
    if (!parsed) return [];
    return getHijriDateInfo(parsed.day, parsed.month);
  }, [date]);

  return { hijriDateString, hijriDateInfoList };
}
