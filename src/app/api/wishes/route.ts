import { NextRequest } from 'next/server';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth/apiAuth';
import { ensureAdminClient } from '@/lib/api/helpers';

export async function GET() {
  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const { data, error } = await client
    .from('guest_wishes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return jsonError(error.message, 500);
  return jsonOk(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || name.length > 200) {
    return jsonError('Name is required and must be under 200 characters.');
  }
  if (!message || message.length > 2000) {
    return jsonError('Message is required and must be under 2000 characters.');
  }

  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const { data, error } = await client
    .from('guest_wishes')
    .insert({ name, message })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data, 201);
}
