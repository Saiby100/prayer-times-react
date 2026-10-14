import { useState, useEffect, useMemo } from 'react';
import { getCachedTimes, setCachedTimes, getDisabledPrayers } from '@/stores';
import { getNextDay, getPrevDay, dateToString, isSameDay } from '@/utils/date';
import { fetchTimes, areaToSlug } from '@/services/prayerTimes';
import { toDisplayNames } from '@/utils/prayerNames';
import { getTimesForDay, mapDays, type MonthTimes } from '@/utils/monthTimes';
import log from '@/utils/logger';

function usePTApi({ area }: { area: string }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const [date, setDate] = useState<Date>(new Date());
  const [savedDate, setSavedDate] = useState<Date | null>(null);

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
        type: 'api',
        area,
        month: date.getMonth(),
        year: date.getFullYear(),
      });
      return cached;
    }

    log.info('usePTApi: fetching times from Supabase', {
      type: 'api',
      area,
      date: date.toISOString(),
    });
    const slug = areaToSlug(area);
    const data = mapDays(await fetchTimes(slug, date), toDisplayNames);
    if (Object.keys(data).length > 0) {
      log.info('usePTApi: saving times to storage', {
        type: 'storage',
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

  const nextDay = () => setDateWithSave(getNextDay(date));
  const prevDay = () => setDateWithSave(getPrevDay(date));
  const setToday = () => setDateWithSave(new Date());
  const goToDate = (target: Date) => setDateWithSave(target);
  const dateString = useMemo(() => dateToString(date), [JSON.stringify(date)]);
  const dayString = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }, [JSON.stringify(date)]);
  const highlighted = useMemo(() => {
    const now = new Date();
    if (!todayTimes || !isSameDay(date, now)) return '';
    const hiddenPrayers = getDisabledPrayers();
    const upcoming = Object.entries(todayTimes)
      .filter(([name]) => !hiddenPrayers.includes(name))
      .map(([, timeStr]) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const time = new Date(now);
        time.setHours(hours, minutes, 0, 0);
        return { timeStr, time };
      })
      .filter(({ time }) => time >= now)
      .sort((a, b) => a.time.getTime() - b.time.getTime())[0];
    return upcoming ? upcoming.timeStr : '';
  }, [JSON.stringify(todayTimes), JSON.stringify(date)]);

  return {
    isLoading,
    error,
    retry: fetchAndSetTimes,
    navigate: { next: nextDay, prev: prevDay, today: setToday, goToDate },
    date,
    dateString,
    dayString,
    highlighted,
    todayTimes,
  };
}

export default usePTApi;
