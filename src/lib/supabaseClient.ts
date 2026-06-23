import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = isSupabaseConfigured ? createBrowserClient(supabaseUrl, supabaseAnonKey) : null;
