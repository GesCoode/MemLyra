import { json, type RequestHandler } from '@sveltejs/kit';
import { cookieIsSecure, createUser, findUserByEmail } from '$lib/server/auth';
import { createBaseDeckForUser } from '$lib/server/decks';
import { sendVerificationEmail } from '$lib/server/mail';
import { getAppOrigin } from '$lib/server/origin';

export const POST: RequestHandler = async ({ request, url }) => {
  let body: { email?: string; name?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = body.email?.trim() ?? '';
  const name = body.name?.trim() ?? '';
  const password = body.password ?? '';

  if (!email || !name) {
    return json({ error: 'Enter an account name and email.' }, { status: 400 });
  }

  if (password.length < 6) {
    return json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return json({ error: 'An account with this email already exists.' }, { status: 409 });
  }

  const { user, verificationToken } = await createUser(email, name, password);
  await createBaseDeckForUser(user.id);

  const verifyUrl = `${getAppOrigin(url)}/verify?token=${verificationToken}`;

  let emailSent = false;
  try {
    emailSent = await sendVerificationEmail(user.email, verifyUrl);
  } catch (error) {
    console.error('Failed to send verification email', error);
  }

  return json({
    message: emailSent
      ? 'Check your email to activate your account.'
      : 'Account created, but the activation email could not be sent. Use “Resend activation email” on the log in page.',
    email: user.email,
    emailSent
  });
};
