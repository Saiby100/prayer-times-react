import { supabase } from '@/utils/supabase';
import log from '@/utils/logger';

const MAX_ADJUSTMENT = 2;

/**
 * Fetch the days the local Hijri month starts after Umm al-Qura (1 = a day later).
 * Returns null when it can't be read or is out of range, so the caller keeps its saved value.
 */
export async function fetchHijriAdjustment(): Promise<number | null> {
  if (!supabase) {
    log.error('hijriAdjustment: supabase not initialised', { type: 'fetch-hijri-adjustment' });
    return null;
  }

  const { data, error, status } = await supabase
    .from('app_settings')
    .select('hijri_adjustment')
    .maybeSingle();

  // Status 0 means the request never reached Supabase (e.g. offline), which isn't a fault.
  if (error && status === 0) {
    log.info('hijriAdjustment: network unavailable', {
      type: 'fetch-hijri-adjustment',
      error: error.message,
    });
    return null;
  }

  if (error) {
    log.error('hijriAdjustment: error fetching adjustment', {
      type: 'fetch-hijri-adjustment',
      error: error.message,
    });
    return null;
  }

  const value = data?.hijri_adjustment;
  if (!Number.isInteger(value) || Math.abs(value) > MAX_ADJUSTMENT) {
    log.error('hijriAdjustment: invalid adjustment', { type: 'fetch-hijri-adjustment', value });
    return null;
  }

  return value;
}
