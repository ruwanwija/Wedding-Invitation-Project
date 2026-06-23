import { NextRequest } from 'next/server';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth/apiAuth';
import { ensureAdminClient } from '@/lib/api/helpers';
import { familySchema } from '@/lib/validations/schemas';

export async function GET() {
  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const { data, error } = await client.from('families').select('*').order('side');
  if (error) return jsonError(error.message, 500);
  return jsonOk(data ?? []);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const body = await request.json();
  const parsed = familySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid family payload.');
  }

  const { data: existing } = await client
    .from('families')
    .select('id')
    .eq('side', parsed.data.side)
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await client
      .from('families')
      .update(parsed.data)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) return jsonError(error.message, 500);
    return jsonOk(data);
  }

  const { data, error } = await client.from('families').insert(parsed.data).select().single();
  if (error) return jsonError(error.message, 500);
  return jsonOk(data, 201);
}
