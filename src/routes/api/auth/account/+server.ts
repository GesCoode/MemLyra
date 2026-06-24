import { json, type RequestHandler } from '@sveltejs/kit';
import {
  clearSessionCookie,
  deleteSession,
  deleteUser,
  findUserByEmail,
  SESSION_COOKIE,
  verifyPassword
} from '$lib/server/auth';

export const DELETE: RequestHandler = async ({ locals, cookies, request }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let body: { password?: string };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const password = body.password ?? '';
  if (!password) {
    return json({ error: 'Enter your password to confirm account deletion.' }, { status: 400 });
  }

  const account = await findUserByEmail(locals.user.email);
  if (!account || !(await verifyPassword(password, account.password_hash))) {
    return json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const sessionId = cookies.get(SESSION_COOKIE);
  if (sessionId) {
    await deleteSession(sessionId);
  }

  await deleteUser(locals.user.id);
  clearSessionCookie(cookies);

  return json({ ok: true });
};
