import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseServer';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: NextRequest) {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase Server is not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map(e => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check if the user exists in our admin_users table
    const { data: user, error: checkError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ error: `Database check error: ${checkError.message}` }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Admin email not found. Please register first.' }, { status: 400 });
    }

    // Trigger Supabase Native Email OTP
    const supabaseClient = await createSupabaseServerClient();
    const { error: otpError } = await supabaseClient.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: false,
      }
    });

    if (otpError) {
      const errorMsg = otpError.message === '{}' || otpError.status === 500
        ? 'Supabase email delivery failed. This typically means the default mailer limit (3/hour) is exceeded or SMTP settings are missing/incorrect in your Supabase dashboard.'
        : otpError.message;
      return NextResponse.json({ error: `Failed to send login email: ${errorMsg}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent to email via Supabase' });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
