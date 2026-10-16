import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { addDays, dateToHijriString, parseHijriDate } from '@/utils/date';
import { getHijriDateInfo, type HijriDateInfo } from '@/config/hijriDateInfo';
import { fetchHijriAdjustment } from '@/services/hijriAdjustment';
import { getHijriAdjustment, setHijriAdjustment } from '@/stores';

type UseHijriDateResult = {
  /** Formatted Hijri date string, or null if conversion fails. */
  hijriDateString: string | null;
  /** Events and info matching the current Hijri date. */
  hijriDateInfoList: HijriDateInfo[];
};

export default function useHijriDate(date: Date): UseHijriDateResult {
  const [adjustment, setAdjustment] = useState(getHijriAdjustment);

  // Refresh on open and on each return to the foreground; keep the saved value if it fails.
  useEffect(() => {
    const refresh = async () => {
      const value = await fetchHijriAdjustment();
      if (value === null) return;
      setHijriAdjustment(value);
      setAdjustment(value);
    };
    refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, []);

  // A local month that starts N days later is N days behind Umm al-Qura.
  const hijriDate = useMemo(() => addDays(date, -adjustment), [date, adjustment]);

  const hijriDateString = useMemo(() => dateToHijriString(hijriDate), [hijriDate]);

  const hijriDateInfoList = useMemo(() => {
    const parsed = parseHijriDate(hijriDate);
    if (!parsed) return [];
    return getHijriDateInfo(parsed.day, parsed.month);
  }, [hijriDate]);

  return { hijriDateString, hijriDateInfoList };
}
