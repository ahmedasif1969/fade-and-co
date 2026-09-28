import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';
import { createAdminSupabaseClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = createAdminSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    const response = NextResponse.json({ success: true });
    response.cookies.delete(ADMIN_COOKIE_NAME);
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.json({ success: true });
    response.cookies.delete(ADMIN_COOKIE_NAME);
    return response;
  }
}
