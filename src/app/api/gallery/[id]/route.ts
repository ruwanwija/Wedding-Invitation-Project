import { NextRequest } from 'next/server';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth/apiAuth';
import { ensureAdminClient } from '@/lib/api/helpers';
import { galleryImageSchema } from '@/lib/validations/schemas';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const body = await request.json();
  const parsed = galleryImageSchema.partial().safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid gallery image.');
  }

  const { data, error } = await client
    .from('gallery_images')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const { error } = await client.from('gallery_images').delete().eq('id', id);
  if (error) return jsonError(error.message, 500);
  return jsonOk({ success: true });
}
