import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'fade_admin_session';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hello@fadeandco.com';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'FadeAndCo2026!';

export async function isAuthenticatedAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (sessionToken && sessionToken === 'authenticated_fade_admin') {
    return true;
  }

  return false;
}
