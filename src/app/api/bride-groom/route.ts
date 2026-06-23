import { NextRequest } from 'next/server';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth/apiAuth';
import { ensureAdminClient } from '@/lib/api/helpers';
import { brideGroomSchema } from '@/lib/validations/schemas';

export async function GET() {
  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const { data, error } = await client.from('bride_groom').select('*').order('type');
  if (error) return jsonError(error.message, 500);
  return jsonOk(data ?? []);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const body = await request.json();
  const parsed = brideGroomSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid bride/groom payload.');
  }

  const { data: existing } = await client
    .from('bride_groom')
    .select('id')
    .eq('type', parsed.data.type)
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await client
      .from('bride_groom')
      .update(parsed.data)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) return jsonError(error.message, 500);
    return jsonOk(data);
  }

  const { data, error } = await client.from('bride_groom').insert(parsed.data).select().single();
  if (error) return jsonError(error.message, 500);
  return jsonOk(data, 201);
}
