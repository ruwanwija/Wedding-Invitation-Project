import { NextRequest } from 'next/server';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth/apiAuth';
import { ensureAdminClient } from '@/lib/api/helpers';
import { timelineEventSchema, reorderSchema } from '@/lib/validations/schemas';

export async function GET() {
  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const { data, error } = await client
    .from('timeline_events')
    .select('*')
    .order('order_index', { ascending: true });
  if (error) return jsonError(error.message, 500);
  return jsonOk(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const body = await request.json();
  const parsed = timelineEventSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid timeline event.');
  }

  let orderIndex = parsed.data.order_index;
  if (orderIndex === undefined) {
    const { count } = await client
      .from('timeline_events')
      .select('*', { count: 'exact', head: true });
    orderIndex = count ?? 0;
  }

  const { data, error } = await client
    .from('timeline_events')
    .insert({ ...parsed.data, order_index: orderIndex })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data, 201);
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const body = await request.json();
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid reorder payload.');
  }

  const updates = parsed.data.ids.map((id, index) =>
    client.from('timeline_events').update({ order_index: index }).eq('id', id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return jsonError(failed.error.message, 500);

  return jsonOk({ success: true });
}
