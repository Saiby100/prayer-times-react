import PTApi from '@/utils/PTApi';
import { useRef, useState, useEffect, useMemo } from 'react';
import getStorage from '@/utils/localStore';
import { getNextDay, getPrevDay, dateToString } from '@/utils/date';

function usePTApi({ area }: { area: string }) {
  const api = useRef(new PTApi());
  const storage = useRef(getStorage());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [date, setDate] = useState<Date>(new Date());
  const [savedDate, setSavedDate] = useState<Date | null>(null);

  const [times, setTimes] = useState<Array<Record<string, string>>>([]);
  const [todayTimes, setTodayTimes] = useState<Record<string, string>>({});

  const setDateWithSave = (newDate: Date, save: Date | null = null) => {
    setSavedDate(save || date);
    setDate(newDate);
  };

  const fetchTimes = async () => {
    if (storage.current.contains(`times_${date.getMonth()}_${date.getFullYear()}_${area}`)) {
      const timesData = storage.current.getString(
        `times_${date.getMonth()}_${date.getFullYear()}_${area}`
      );
      return timesData ? JSON.parse(timesData) : [];
    } else {
      api.current.setArea(area);
      return (await api.current.fetchTimes(date)) ?? [];
    }
  };

  const fetchAndSetTimes = async () => {
    setIsLoading(true);
    api.current.setArea(area);
    const timesData = await fetchTimes();
    setTimes(timesData);
    setTodayTimes(timesData[date.getDate() - 1]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (savedDate?.getMonth() !== date.getMonth()) {
      // Fetch times data
      fetchAndSetTimes();
    }
  }, [JSON.stringify(date)]);

  useEffect(() => {
    // Save times of the current month to storage
    if (!times || times.length === 0) return;
    if (
      date.getMonth() !== new Date().getMonth() ||
      date.getFullYear() !== new Date().getFullYear()
    )
      return;
    if (storage.current.contains(`times_${date.getMonth()}_${date.getFullYear()}_${area}`)) return;
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    console.log('Saving times to storage');
    storage.current.set(`times_${month}_${year}_${area}`, JSON.stringify(times));
  }, [JSON.stringify(times)]);

  const nextDay = () => {
    const newDate = getNextDay(date);
    setDateWithSave(newDate);
    setTodayTimes(times[newDate.getDate() - 1]);
  };
  const prevDay = () => {
    const newDate = getPrevDay(date);
    setDateWithSave(newDate);
    setTodayTimes(times[newDate.getDate() - 1]);
  };
  const setToday = () => {
    const newDate = new Date();
    setDateWithSave(newDate);
    setTodayTimes(times[newDate.getDate() - 1]);
  };
  const goToDate = (target: Date) => {
    setDateWithSave(target);
    if (target.getMonth() === date.getMonth() && target.getFullYear() === date.getFullYear()) {
      setTodayTimes(times[target.getDate() - 1]);
    }
  };
  const dateString = useMemo(() => dateToString(date), [JSON.stringify(date)]);
  const dayString = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }, [JSON.stringify(date)]);
  const highlighted = useMemo(() => {
    if (date.getDate() !== new Date().getDate()) return '';
    const now = new Date();
    // Find the first time that is after now
    const upcoming = Object.values(todayTimes)
      .map((timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const time = new Date(now);
        time.setHours(hours, minutes, 0, 0);
        return { timeStr, time };
      })
      .filter(({ time }) => time >= now)
      .sort((a, b) => a.time.getTime() - b.time.getTime())[0];
    return upcoming ? upcoming.timeStr : '';
  }, [JSON.stringify(todayTimes)]);

  return {
    isLoading,
    navigate: { next: nextDay, prev: prevDay, today: setToday, goToDate },
    date,
    dateString,
    dayString,
    highlighted,
    todayTimes,
  };
}

export default usePTApi;
