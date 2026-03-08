import { useMemo } from 'react';

import { dateToHijriString, parseHijriDate } from '@/utils/date';
import { getHijriDateInfo, type HijriDateInfo } from '@/config/hijriDateInfo';
import getStorage from '@/utils/localStore';

type UseHijriDateResult = {
  showHijri: boolean;
  hijriDateString: string | null;
  hijriDateInfoList: HijriDateInfo[];
  toggleShowHijri: () => void;
  hijriSupported: boolean;
};

export default function useHijriDate(date: Date): UseHijriDateResult {
  const storage = getStorage();

  const hijriDateString = useMemo(() => dateToHijriString(date), [date]);
  const hijriSupported = hijriDateString !== null;

  const hijriDateInfoList = useMemo(() => {
    const parsed = parseHijriDate(date);
    if (!parsed) return [];
    return getHijriDateInfo(parsed.day, parsed.month);
  }, [date]);

  const showHijri = storage.getBoolean('showHijriDate') ?? true;

  const toggleShowHijri = () => {
    storage.set('showHijriDate', !showHijri);
  };

  return { showHijri, hijriDateString, hijriDateInfoList, toggleShowHijri, hijriSupported };
}
