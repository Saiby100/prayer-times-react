import { supabase } from '@/utils/supabase';
import log from '@/utils/logger';
import { monthRange, type MonthTimes } from '@/utils/monthTimes';

export type Area = {
  /** URL-friendly identifier. */
  slug: string;
  /** Human-readable area name. */
  name: string;
};

export async function fetchAreas(): Promise<Area[]> {
  if (!supabase) {
    log.error('prayerTimes: supabase not initialised', { type: 'fetch-areas' });
    return [];
  }

  const { data, error } = await supabase.from('areas').select('slug, name').order('name');

  if (error) {
    log.error('prayerTimes: error fetching areas', { type: 'fetch-areas', error: error.message });
    return [];
  }

  return data ?? [];
}

/** Fetch a month's times for the date's month, keyed by `MM-DD`. The year is ignored. */
export async function fetchTimes(areaSlug: string, date: Date): Promise<MonthTimes> {
  if (!supabase) {
    log.error('prayerTimes: supabase not initialised', { type: 'fetch-prayer-times' });
    return {};
  }

  const [startDate, endDate] = monthRange(date.getMonth());

  const { data, error } = await supabase
    .from('prayer_times')
    .select('date, times')
    .eq('area_slug', areaSlug)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date');

  if (error) {
    log.error('prayerTimes: error fetching times', {
      type: 'fetch-prayer-times',
      error: error.message,
      area: areaSlug,
    });
    return {};
  }

  return Object.fromEntries(
    (data ?? []).map((row) => [
      (row.date as string).slice(5),
      sortTimesByTime(row.times as Record<string, string>),
    ])
  );
}

/** Convert an "HH:MM" time string to minutes since midnight for comparison. */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Reorder a prayer-times record so its entries are in ascending time order. */
function sortTimesByTime(times: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(times).sort(([, a], [, b]) => timeToMinutes(a) - timeToMinutes(b))
  );
}

export function areaToSlug(area: string): string {
  return area.replaceAll("'", '').replaceAll(' ', '').toLowerCase();
}
