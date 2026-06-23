import { NextRequest } from 'next/server';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth/apiAuth';
import { ensureAdminClient } from '@/lib/api/helpers';

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const { error } = await client.from('guest_wishes').delete().eq('id', id);
  if (error) return jsonError(error.message, 500);
  return jsonOk({ success: true });
}
