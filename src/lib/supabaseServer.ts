import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY ?? '';

export const isSupabaseAdminConfigured = !!(supabaseUrl && supabaseSecretKey);

export const supabaseAdmin = isSupabaseAdminConfigured
  ? createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
