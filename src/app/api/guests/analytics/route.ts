import { NextRequest } from 'next/server';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth/apiAuth';
import { ensureAdminClient } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  try {
    // 1. Fetch guest RSVP details
    const { data: allGuests, error: guestsErr } = await client
      .from('guests')
      .select('rsvp_status, rsvp_guests_count');

    if (guestsErr) return jsonError(guestsErr.message, 500);

    const totalGuests = allGuests?.length ?? 0;
    let totalAttendingGuests = 0;
    let totalDeclined = 0;
    let pendingRsvps = 0;

    allGuests?.forEach((g) => {
      if (g.rsvp_status === 'attending') {
        totalAttendingGuests += (g.rsvp_guests_count || 0);
      } else if (g.rsvp_status === 'declined') {
        totalDeclined++;
      } else {
        pendingRsvps++;
      }
    });

    // 2. Fetch all visits to count unique guest views
    const { data: visits, error: visitsErr } = await client
      .from('invitation_visits')
      .select('guest_id');

    if (visitsErr) return jsonError(visitsErr.message, 500);

    const viewedGuests = new Set(visits?.map((v) => v.guest_id) ?? []);
    const invitationsViewed = viewedGuests.size;
    const pendingViews = Math.max(0, totalGuests - invitationsViewed);

    return jsonOk({
      totalGuests,
      totalLinks: totalGuests,
      invitationsViewed,
      pendingViews,
      totalAttendingGuests,
      totalDeclined,
      pendingRsvps,
    });
  } catch (e: any) {
    return jsonError(e.message || 'Failed to fetch analytics', 500);
  }
}
