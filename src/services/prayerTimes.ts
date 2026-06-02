import { supabase } from '@/utils/supabase';
import log from '@/utils/logger';

export type Area = {
  /** URL-friendly identifier. */
  slug: string;
  /** Human-readable area name. */
  name: string;
};

export async function fetchAreas(): Promise<Area[]> {
  if (!supabase) {
    log.error('prayerTimes: supabase not initialised', { type: 'api' });
    return [];
  }

  const { data, error } = await supabase.from('areas').select('slug, name').order('name');

  if (error) {
    log.error('prayerTimes: error fetching areas', { type: 'api', error: error.message });
    return [];
  }

  return data ?? [];
}

export async function fetchTimes(areaSlug: string, date: Date): Promise<Record<string, string>[]> {
  if (!supabase) {
    log.error('prayerTimes: supabase not initialised', { type: 'api' });
    return [];
  }

  const year = date.getFullYear();
  const month = date.getMonth();
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('prayer_times')
    .select('times')
    .eq('area_slug', areaSlug)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date');

  if (error) {
    log.error('prayerTimes: error fetching times', {
      type: 'api',
      error: error.message,
      area: areaSlug,
    });
    return [];
  }

  return (data ?? []).map((row) => sortTimesByTime(row.times as Record<string, string>));
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
