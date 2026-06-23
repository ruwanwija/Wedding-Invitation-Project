import { verifyAuth } from '@supabase/server/core';
import { NextResponse } from 'next/server';

export async function requireAuth(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const jwksUrl = process.env.SUPABASE_JWKS_URL;

  if (!supabaseUrl || !publishableKey || !secretKey) {
    return {
      error: NextResponse.json({ error: 'Supabase is not configured on the server.' }, { status: 503 }),
    };
  }

  const { data, error } = await verifyAuth(request, {
    auth: 'user',
    env: {
      url: supabaseUrl,
      publishableKeys: { default: publishableKey },
      secretKeys: { default: secretKey },
      jwks: new URL(jwksUrl ?? `${supabaseUrl}/auth/v1/.well-known/jwks.json`),
    },
  });

  if (error) {
    return {
      error: NextResponse.json({ error: error.message }, { status: error.status ?? 401 }),
    };
  }

  return { user: data.userClaims };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
