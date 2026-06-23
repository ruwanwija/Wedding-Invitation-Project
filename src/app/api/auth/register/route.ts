import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseServer';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const registerSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  mobile: z.string().min(1, 'Mobile number is required'),
  email: z.string().email('Please enter a valid email address'),
  city: z.string().min(1, 'City is required'),
});

export async function POST(request: NextRequest) {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase Server is not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map(e => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, email, mobile, city } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check if the user already exists in admin_users
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ error: `Database check error: ${checkError.message}` }, { status: 500 });
    }

    if (existingUser && existingUser.is_verified) {
      return NextResponse.json({ error: 'An admin with this email is already registered and verified.' }, { status: 400 });
    }

    let authUserId = existingUser?.id;

    // Create user in Supabase Auth if they don't exist
    if (!authUserId) {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        email_confirm: true,
        user_metadata: { full_name: name, mobile_number: mobile, city }
      });

      if (authError) {
        // If user already exists in auth.users, try to match
        if (authError.message.includes('already exists')) {
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          const matchedUser = listData?.users.find(u => u.email === cleanEmail);
          if (matchedUser) {
            authUserId = matchedUser.id;
            // Force email confirm to true for existing unconfirmed auth users
            await supabaseAdmin.auth.admin.updateUserById(authUserId, {
              email_confirm: true
            });
          } else {
            return NextResponse.json({ error: 'Auth user conflict. Please try again.' }, { status: 500 });
          }
        } else {
          return NextResponse.json({ error: `Auth registration failed: ${authError.message}` }, { status: 500 });
        }
      } else {
        authUserId = authUser.user.id;
      }
    }

    // Save or update user in custom admin_users table
    const { error: dbError } = await supabaseAdmin
      .from('admin_users')
      .upsert({
        id: authUserId,
        full_name: name,
        mobile_number: mobile,
        email: cleanEmail,
        city,
        is_verified: false,
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      return NextResponse.json({ error: `Database save failed: ${dbError.message}` }, { status: 500 });
    }

    // Trigger Supabase Native Email OTP
    const supabaseClient = await createSupabaseServerClient();
    const { error: otpError } = await supabaseClient.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: false, // Already created above
      }
    });

    if (otpError) {
      const errorMsg = otpError.message === '{}' || otpError.status === 500
        ? 'Supabase email delivery failed. This typically means the default mailer limit (3/hour) is exceeded or SMTP settings are missing/incorrect in your Supabase dashboard.'
        : otpError.message;
      return NextResponse.json({ error: `Failed to send verification email: ${errorMsg}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent to email via Supabase' });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
