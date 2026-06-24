import { NextRequest } from 'next/server';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth/apiAuth';
import { ensureAdminClient } from '@/lib/api/helpers';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const body = await request.json();
  if (!Array.isArray(body)) {
    return jsonError('Payload must be a JSON array of guests.');
  }

  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  // 1. Fetch existing whatsapp numbers to avoid database conflicts
  const { data: existing, error: fetchErr } = await client
    .from('guests')
    .select('whatsapp_number');

  if (fetchErr) return jsonError(fetchErr.message, 500);

  const existingNumbers = new Set(existing?.map((r) => r.whatsapp_number) ?? []);
  const origin = request.nextUrl.origin;

  const guestsToInsert = [];
  const skippedCount = { duplicateInDb: 0, duplicateInPayload: 0, invalid: 0 };
  const processedNumbers = new Set<string>();

  for (const item of body) {
    const guest_name = typeof item.guest_name === 'string' ? item.guest_name.trim() : '';
    const whatsapp_number = typeof item.whatsapp_number === 'string' ? item.whatsapp_number.trim() : '';
    const invitation_type = typeof item.invitation_type === 'string' ? item.invitation_type.trim() : 'individual';

    if (!guest_name || !whatsapp_number || !['individual', 'spouse', 'family'].includes(invitation_type)) {
      skippedCount.invalid++;
      continue;
    }

    if (processedNumbers.has(whatsapp_number)) {
      skippedCount.duplicateInPayload++;
      continue;
    }

    if (existingNumbers.has(whatsapp_number)) {
      skippedCount.duplicateInDb++;
      continue;
    }

    processedNumbers.add(whatsapp_number);

    // Generate unique link
    const invitation_token = crypto.randomBytes(5).toString('hex');
    const invitation_link = `${origin}/invitation/${invitation_token}`;

    guestsToInsert.push({
      guest_name,
      whatsapp_number,
      invitation_type,
      invitation_token,
      invitation_link
    });
  }

  if (guestsToInsert.length === 0) {
    return jsonOk({
      message: 'No new guests were imported.',
      insertedCount: 0,
      skippedCount
    });
  }

  const { data, error: insertErr } = await client
    .from('guests')
    .insert(guestsToInsert)
    .select();

  if (insertErr) return jsonError(insertErr.message, 500);

  return jsonOk({
    message: `Successfully imported ${data.length} guests.`,
    insertedCount: data.length,
    skippedCount
  }, 201);
}
