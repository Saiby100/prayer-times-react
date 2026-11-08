import { getArea, getDisabledPrayers } from '@/stores';
import { loadMonth } from '@/services/prayerTimes';
import { getNextDay } from '@/utils/date';
import { getTimesForDay } from '@/utils/monthTimes';
import { getNextPrayer } from '@/utils/nextPrayer';
import { buildWidgetData, type WidgetData } from '@/utils/widgetData';

/**
 * What the widgets show now, from the saved area, hidden prayers and times. A month that isn't
 * saved is fetched; tomorrow's month only when today has no visible prayer left, so the last
 * day of a month doesn't fetch on every redraw.
 */
export async function loadWidgetData(now: Date = new Date()): Promise<WidgetData> {
  const area = getArea();
  const hidden = getDisabledPrayers();
  if (!area) return buildWidgetData({ area, hidden, now, todayMonth: null, tomorrowMonth: null });

  const todayMonth = await loadMonth(now, area);
  const tomorrow = getNextDay(now);

  let tomorrowMonth = tomorrow.getMonth() === now.getMonth() ? todayMonth : null;
  const todayTimes = todayMonth ? getTimesForDay(todayMonth, now) : undefined;
  if (!tomorrowMonth && todayTimes && !getNextPrayer(todayTimes, null, hidden, now)) {
    tomorrowMonth = await loadMonth(tomorrow, area);
  }

  return buildWidgetData({ area, hidden, now, todayMonth, tomorrowMonth });
}
