import { NextRequest } from 'next/server';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth/apiAuth';
import { ensureAdminClient } from '@/lib/api/helpers';
import { weddingInfoSchema } from '@/lib/validations/schemas';

export async function GET() {
  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const { data, error } = await client.from('wedding_info').select('*').limit(1).maybeSingle();
  if (error) return jsonError(error.message, 500);
  return jsonOk(data);
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const body = await request.json();
  const parsed = weddingInfoSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid wedding info payload.');
  }

  const { data: existing } = await client.from('wedding_info').select('id').limit(1).maybeSingle();

  if (existing?.id) {
    const { data, error } = await client
      .from('wedding_info')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) return jsonError(error.message, 500);
    return jsonOk(data);
  }

  const { data, error } = await client.from('wedding_info').insert(parsed.data).select().single();
  if (error) return jsonError(error.message, 500);
  return jsonOk(data, 201);
}
