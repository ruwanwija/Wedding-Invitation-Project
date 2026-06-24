import { NextRequest } from 'next/server';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth/apiAuth';
import { ensureAdminClient } from '@/lib/api/helpers';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const { data, error } = await client
    .from('guests')
    .select('*, invitation_visits(id)')
    .order('created_at', { ascending: false });

  if (error) return jsonError(error.message, 500);
  return jsonOk(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

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

  // Generate unique 10-char token
  const invitation_token = crypto.randomBytes(5).toString('hex');
  
  // Dynamically compute absolute invitation URL
  const origin = request.nextUrl.origin;
  const invitation_link = `${origin}/invitation/${invitation_token}`;

  const { data, error } = await client
    .from('guests')
    .insert({
      guest_name,
      whatsapp_number,
      invitation_type,
      invitation_token,
      invitation_link
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return jsonError('A guest with this WhatsApp number is already registered.', 409);
    }
    return jsonError(error.message, 500);
  }

  return jsonOk(data, 201);
}
