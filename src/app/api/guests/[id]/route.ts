import { NextRequest } from 'next/server';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth/apiAuth';
import { ensureAdminClient } from '@/lib/api/helpers';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const body = await request.json();
  const guest_name = typeof body.guest_name === 'string' ? body.guest_name.trim() : '';
  const whatsapp_number = typeof body.whatsapp_number === 'string' ? body.whatsapp_number.trim() : '';
  const invitation_type = typeof body.invitation_type === 'string' ? body.invitation_type.trim() : '';

  if (!guest_name) {
    return jsonError('Guest name is required.');
  }

  if (!whatsapp_number) {
    return jsonError('WhatsApp number is required.');
  }

  if (!['individual', 'spouse', 'family'].includes(invitation_type)) {
    return jsonError('Invalid invitation type.');
  }

  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const { data, error } = await client
    .from('guests')
    .update({
      guest_name,
      whatsapp_number,
      invitation_type,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return jsonError('A guest with this WhatsApp number is already registered.', 409);
    }
    return jsonError(error.message, 500);
  }

  return jsonOk(data);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const { error } = await client
    .from('guests')
    .delete()
    .eq('id', id);

  if (error) return jsonError(error.message, 500);
  return jsonOk({ success: true });
}
