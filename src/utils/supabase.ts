import { createClient, SupabaseClient } from '@supabase/supabase-js';

function initSupabase(): SupabaseClient | null {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('Supabase env vars missing — remote logging disabled');
    return null;
  }

  try {
    return createClient(url, key);
  } catch (e) {
    console.warn('Supabase failed to initialise:', e);
    return null;
  }
}

export const supabase = initSupabase();
