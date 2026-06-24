import { error } from '@sveltejs/kit';
import {
  cookieIsSecure,
  createSession,
  invalidateSessionsForUser,
  setSessionCookie,
  verifyEmailWithToken
} from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, cookies }) => {
  const token = url.searchParams.get('token');

  if (!token) {
    return { status: 'invalid' as const, signedIn: false };
  }

  const userId = await verifyEmailWithToken(token);
  if (!userId) {
    return { status: 'invalid' as const, signedIn: false };
  }

  try {
    await invalidateSessionsForUser(userId);
    const session = await createSession(userId);
    setSessionCookie(cookies, session.id, session.expiresAt, cookieIsSecure(url));
    return { status: 'success' as const, signedIn: true };
  } catch {
    error(500, 'Account was verified but sign-in failed. Try logging in.');
  }
};
