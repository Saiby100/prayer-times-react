import { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import {
  getCachedTimes,
  setCachedTimes,
  getDisabledPrayers,
  subscribeDisabledPrayers,
} from '@/stores';
import { getNextDay, getPrevDay, dateToString, isSameDay } from '@/utils/date';
import { fetchTimes, areaToSlug } from '@/services/prayerTimes';
import { toDisplayNames } from '@/utils/prayerNames';
import { getTimesForDay, mapDays, type MonthTimes } from '@/utils/monthTimes';
import { getNextPrayer } from '@/utils/nextPrayer';
import log from '@/utils/logger';

function usePTApi({ area }: { area: string }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const [date, setDate] = useState<Date>(new Date());
  const [savedDate, setSavedDate] = useState<Date | null>(null);
  // When the app was last opened or brought back to the foreground. No timer: it only moves then.
  const [now, setNow] = useState<Date>(new Date());
  const hiddenPrayers = useSyncExternalStore(subscribeDisabledPrayers, getDisabledPrayers);

  const [times, setTimes] = useState<MonthTimes>({});
  // Derived so no handler can read the wrong month: null until `date`'s month is loaded.
  const todayTimes = useMemo(() => getTimesForDay(times, date) ?? null, [times, date]);

  const setDateWithSave = (newDate: Date, save: Date | null = null) => {
    setSavedDate(save || date);
    setDate(newDate);
  };

  const fetchTimesData = async () => {
    const cached = getCachedTimes(date, area);
    if (cached) {
      log.debug('usePTApi: cache hit', {
        type: 'load-prayer-times',
        area,
        month: date.getMonth(),
        year: date.getFullYear(),
      });
      return cached;
    }

    log.info('usePTApi: fetching times from Supabase', {
      type: 'load-prayer-times',
      area,
      date: date.toISOString(),
    });
    const slug = areaToSlug(area);
    const data = mapDays(await fetchTimes(slug, date), toDisplayNames);
    if (Object.keys(data).length > 0) {
      log.info('usePTApi: saving times to storage', {
        type: 'load-prayer-times',
        month: date.getMonth(),
        area,
      });
      setCachedTimes(date, area, data);
    }
    return data;
  };

  const fetchAndSetTimes = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const timesData = await fetchTimesData();
      if (Object.keys(timesData).length === 0) {
        setError(true);
      } else {
        setTimes(timesData);
      }
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSetTimes();
  }, [area]);

  useEffect(() => {
    if (savedDate?.getMonth() !== date.getMonth()) {
      fetchAndSetTimes();
    }
  }, [JSON.stringify(date)]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const current = new Date();
      // Was showing today and the day has changed since → show the new today.
      if (isSameDay(date, now) && !isSameDay(now, current)) {
        setSavedDate(date);
        setDate(current);
      }
      setNow(current);
    });
    return () => subscription.remove();
  }, [date, now]);

  const nextDay = () => setDateWithSave(getNextDay(date));
  const prevDay = () => setDateWithSave(getPrevDay(date));
  const setToday = () => setDateWithSave(new Date());
  const goToDate = (target: Date) => setDateWithSave(target);
  // Leave a month that failed to load. Same month: the month effect won't refetch, so retry here.
  const goToToday = () => {
    const today = new Date();
    setDateWithSave(today);
    if (today.getMonth() === date.getMonth()) fetchAndSetTimes();
  };
  const dateString = useMemo(() => dateToString(date), [JSON.stringify(date)]);
  const dayString = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }, [JSON.stringify(date)]);
  // Name of the next prayer when it falls on the shown day (after Isha: tomorrow's Fajr), else ''.
  const highlighted = useMemo(() => {
    if (!todayTimes) return '';
    const showingToday = isSameDay(date, now);
    if (!showingToday && !isSameDay(date, getNextDay(now))) return '';
    // Showing tomorrow: today may be in the previous month, which is then only in the cache.
    const nowTimes = showingToday
      ? todayTimes
      : (getTimesForDay(times, now) ?? getTimesForDay(getCachedTimes(now, area) ?? {}, now));
    if (!nowTimes) return '';
    const next = getNextPrayer(nowTimes, showingToday ? null : todayTimes, hiddenPrayers, now);
    return next && isSameDay(next.date, date) ? next.name : '';
  }, [todayTimes, times, date, now, area, hiddenPrayers]);

  return {
    isLoading,
    error,
    retry: fetchAndSetTimes,
    goToToday,
    navigate: { next: nextDay, prev: prevDay, today: setToday, goToDate },
    date,
    dateString,
    dayString,
    highlighted,
    todayTimes,
  };
}

export default usePTApi;
