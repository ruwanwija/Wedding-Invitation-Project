import { NextRequest, NextResponse } from 'next/server';
import { getGuestByToken } from '@/lib/db';
import { ensureAdminClient } from '@/lib/api/helpers';

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { token } = await context.params;
  
  try {
    const guest = await getGuestByToken(token);

    if (guest) {
      const { client } = ensureAdminClient();
      if (client) {
        const ua = request.headers.get('user-agent') || '';
        let deviceType = 'Desktop';
        if (/mobi/i.test(ua)) {
          deviceType = 'Mobile';
        } else if (/tablet|ipad/i.test(ua)) {
          deviceType = 'Tablet';
        }

        let browser = 'Unknown';
        if (/chrome|crios/i.test(ua)) {
          browser = 'Chrome';
        } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
          browser = 'Safari';
        } else if (/firefox|fxios/i.test(ua)) {
          browser = 'Firefox';
        } else if (/edge|edg/i.test(ua)) {
          browser = 'Edge';
        } else if (/opr|opera/i.test(ua)) {
          browser = 'Opera';
        }

        const ipAddress =
          request.headers.get('x-forwarded-for')?.split(',')[0] ||
          request.headers.get('x-real-ip') ||
          '127.0.0.1';

        await client.from('invitation_visits').insert({
          guest_id: guest.id,
          device_type: deviceType,
          browser,
          ip_address: ipAddress,
        });
      }
    }
  } catch (err) {
    console.error('Failed to resolve guest token or log visit:', err);
  }

  // Always redirect to home page with guest token query param
  const origin = request.nextUrl.origin;
  return NextResponse.redirect(`${origin}/?guest=${token}`);
}
