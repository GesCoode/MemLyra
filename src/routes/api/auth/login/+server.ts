import { json, type RequestHandler } from '@sveltejs/kit';
import {
  cookieIsSecure,
  createSession,
  findUserByEmail,
  setSessionCookie,
  verifyPassword
} from '$lib/server/auth';
import { ensureDevAdminAccount, resolveDevLoginEmail } from '$lib/server/devAdmin';

export const POST: RequestHandler = async ({ request, cookies, url }) => {
  let body: { email?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = body.email?.trim() ?? '';
  const password = body.password ?? '';

  if (!email || !password) {
    return json({ error: 'Enter your email and password.' }, { status: 400 });
  }

  await ensureDevAdminAccount();

  const account = await findUserByEmail(resolveDevLoginEmail(email));
  if (!account || !(await verifyPassword(password, account.password_hash))) {
    return json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  if (!account.email_verified) {
    return json(
      { error: 'Please verify your email before signing in. Check your inbox for the activation link.' },
      { status: 403 }
    );
  }

  const session = await createSession(account.id);
  setSessionCookie(cookies, session.id, session.expiresAt, cookieIsSecure(url));

  return json({
    user: {
      id: account.id,
      email: account.email,
      name: account.name,
      createdAt: account.created_at.toISOString()
    }
  });
};
