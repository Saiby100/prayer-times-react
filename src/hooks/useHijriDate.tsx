import { useMemo, useReducer } from 'react';

import { dateToHijriString } from '@/utils/date';
import getStorage from '@/utils/localStore';

type UseHijriDateResult = {
  showHijri: boolean;
  hijriDateString: string | null;
  toggleShowHijri: () => void;
  hijriSupported: boolean;
};

export default function useHijriDate(date: Date): UseHijriDateResult {
  const storage = getStorage();
  const [, forceRender] = useReducer((x: number) => x + 1, 0);

  const hijriDateString = useMemo(() => dateToHijriString(date), [date]);
  const hijriSupported = hijriDateString !== null;

  const showHijri = storage.getBoolean('showHijriDate') ?? true;

  const toggleShowHijri = () => {
    storage.set('showHijriDate', !showHijri);
    forceRender();
  };

  return { showHijri, hijriDateString, toggleShowHijri, hijriSupported };
}
