import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. The app will use local demo data until they are configured.');
}

/**
 * The one Supabase client for the browser.
 *
 * Keep it that way. A second client sharing this storage key means two GoTrue
 * instances managing the same stored session — the library warns about it, and
 * they can race to rotate the refresh token, after which the loser fails with
 * "Invalid Refresh Token: Refresh Token Not Found" and the session is dropped.
 *
 * Server-side reads build their own short-lived client in serverContent.ts with
 * persistSession off, so they never touch this session.
 */
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
