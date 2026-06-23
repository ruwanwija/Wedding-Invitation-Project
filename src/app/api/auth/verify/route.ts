import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseServer';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const verifySchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otpCode: z.string().min(6, 'Verification code must be at least 6 digits').max(8, 'Verification code must be at most 8 digits'),
});

export async function POST(request: NextRequest) {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase Server is not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const result = verifySchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map(e => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email, otpCode } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    // Verify the OTP code natively through Supabase Auth
    const supabaseClient = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabaseClient.auth.verifyOtp({
      email: cleanEmail,
      token: otpCode,
      type: 'email'
    });

    if (authError) {
      return NextResponse.json({ error: `Verification failed: ${authError.message}` }, { status: 401 });
    }

    // Mark admin_user as verified in our custom table
    const { error: updateUserError } = await supabaseAdmin
      .from('admin_users')
      .update({ is_verified: true })
      .eq('email', cleanEmail);

    if (updateUserError) {
      console.error(`Failed to mark user verified in DB: ${updateUserError.message}`);
      // Don't fail the login since they verified successfully in Supabase Auth, but log it
    }

    return NextResponse.json({
      success: true,
      message: 'Verification Successful',
      user: authData.user,
      session: authData.session
    });
  } catch (error: any) {
    console.error('Verify API error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
