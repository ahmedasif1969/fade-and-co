import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } from '@/lib/auth';
import { createAdminSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter both email and password' },
        { status: 400 }
      );
    }

    // 1. Check Supabase Auth if available
    const supabase = createAdminSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.session) {
        const response = NextResponse.json({ success: true, user: data.user });
        response.cookies.set(ADMIN_COOKIE_NAME, 'authenticated_fade_admin', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
        return response;
      }
    }

    // 2. Direct Environment-backed Admin Authentication fallback
    if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const response = NextResponse.json({
        success: true,
        user: { email: ADMIN_EMAIL, role: 'admin' },
      });

      response.cookies.set(ADMIN_COOKIE_NAME, 'authenticated_fade_admin', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid email or password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
