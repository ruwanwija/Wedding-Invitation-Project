import { NextRequest } from 'next/server';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth/apiAuth';
import { ensureAdminClient } from '@/lib/api/helpers';
import { musicSettingsSchema } from '@/lib/validations/schemas';

export async function GET() {
  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const { data, error } = await client.from('music_settings').select('*').limit(1).maybeSingle();
  if (error) return jsonError(error.message, 500);
  return jsonOk(data);
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const body = await request.json();
  const parsed = musicSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid music settings.');
  }

  const { data: existing } = await client.from('music_settings').select('id').limit(1).maybeSingle();

  if (existing?.id) {
    const { data, error } = await client
      .from('music_settings')
      .update(parsed.data)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) return jsonError(error.message, 500);
    return jsonOk(data);
  }

  const { data, error } = await client.from('music_settings').insert(parsed.data).select().single();
  if (error) return jsonError(error.message, 500);
  return jsonOk(data, 201);
}
