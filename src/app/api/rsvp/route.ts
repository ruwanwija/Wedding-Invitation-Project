import { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/lib/auth/apiAuth';
import { ensureAdminClient } from '@/lib/api/helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    const status = typeof body.status === 'string' ? body.status.trim() : '';
    const guestsCount = typeof body.guestsCount === 'number' ? body.guestsCount : 0;
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!token) {
      return jsonError('Invitation token is required.');
    }

    if (!['attending', 'declined'].includes(status)) {
      return jsonError('Invalid RSVP status. Must be "attending" or "declined".');
    }

    // Connect to Supabase
    const { client, error: clientError } = ensureAdminClient();
    if (clientError) {
      // In local dev mock mode, if Supabase is not configured, we return success
      // so the client-side state machine can fall back to local storage
      return jsonOk({ success: true, mockMode: true });
    }

    // Find the guest by token first
    const { data: guest, error: findError } = await client
      .from('guests')
      .select('*')
      .eq('invitation_token', token)
      .maybeSingle();

    if (findError) {
      return jsonError(findError.message, 500);
    }
    if (!guest) {
      return jsonError('Guest invitation not found.', 404);
    }

    // Validate guest count limits based on invitation type
    let maxGuestsCount = 1;
    if (guest.invitation_type === 'spouse') {
      maxGuestsCount = 2;
    } else if (guest.invitation_type === 'family') {
      maxGuestsCount = 5;
    }

    const validatedGuestsCount =
      status === 'attending' ? Math.min(maxGuestsCount, Math.max(1, guestsCount)) : 0;

    // Update guest RSVP details
    const { data: updatedGuest, error: updateError } = await client
      .from('guests')
      .update({
        rsvp_status: status,
        rsvp_guests_count: validatedGuestsCount,
        rsvp_message: message || null,
        rsvp_submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', guest.id)
      .select()
      .single();

    if (updateError) {
      return jsonError(updateError.message, 500);
    }

    return jsonOk(updatedGuest);
  } catch (err: any) {
    return jsonError(err.message || 'Server error', 500);
  }
}
