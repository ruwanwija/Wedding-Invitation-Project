import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseServer';
import { jsonError } from '@/lib/auth/apiAuth';

export function ensureAdminClient() {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { error: jsonError('Supabase admin client is not configured.', 503) };
  }
  return { client: supabaseAdmin };
}

export const STORAGE_BUCKETS = [
  'bride-groom-images',
  'gallery-images',
  'timeline-images',
  'music-tracks',
  'qr-codes',
] as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[number];

export function getPublicUrl(bucket: StorageBucket, path: string) {
  const { client } = ensureAdminClient();
  if ('error' in client!) return null;
  const { data } = supabaseAdmin!.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
