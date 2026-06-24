import { json, type RequestHandler } from '@sveltejs/kit';
import { createUser, findUserByEmail } from '$lib/server/auth';
import { sendVerificationEmail } from '$lib/server/mail';
import { getAppOrigin } from '$lib/server/origin';
import { validatePassword } from '$lib/utils/passwordPolicy';
import { checkRateLimit, rateLimitKey } from '$lib/server/rateLimit';

export const POST: RequestHandler = async ({ request, url, getClientAddress }) => {
  let body: { email?: string; name?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = body.email?.trim() ?? '';
  const ip = getClientAddress();
  if (!(await checkRateLimit(rateLimitKey('register', ip, email), 5, 60 * 60 * 1000))) {
    return json({ error: 'Too many registration attempts. Try again later.' }, { status: 429 });
  }
  const name = body.name?.trim() ?? '';
  const password = body.password ?? '';

  if (!email || !name) {
    return json({ error: 'Enter an account name and email.' }, { status: 400 });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return json({ error: passwordError }, { status: 400 });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return json({
      message:
        'If this email is not already registered, check your inbox for an activation link. Otherwise try logging in.',
      emailSent: false
    });
  }

  const { user, verificationToken } = await createUser(email, name, password);

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
