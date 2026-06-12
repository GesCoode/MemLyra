import { json, type RequestHandler } from '@sveltejs/kit';
import { createVerificationToken, findUserByEmail } from '$lib/server/auth';
import { sendVerificationEmail } from '$lib/server/mail';
import { getAppOrigin } from '$lib/server/origin';

const GENERIC_MESSAGE =
  'If an account exists for that email and still needs activation, a new activation link has been sent.';

export const POST: RequestHandler = async ({ request, url }) => {
  let body: { email?: string };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = body.email?.trim() ?? '';
  if (!email) {
    return json({ error: 'Enter your email address.' }, { status: 400 });
  }

  const account = await findUserByEmail(email);
  if (account && !account.email_verified) {
    try {
      const verificationToken = await createVerificationToken(account.id);
      const verifyUrl = `${getAppOrigin(url)}/verify?token=${verificationToken}`;
      const emailSent = await sendVerificationEmail(account.email, verifyUrl);

      if (!emailSent) {
        return json(
          {
            error:
              'Email is not configured on the server yet. Contact support to activate your account.'
          },
          { status: 503 }
        );
      }
    } catch (error) {
      console.error('Failed to resend verification email', error);
      return json(
        { error: 'Could not send email right now. Please try again later or contact support.' },
        { status: 503 }
      );
    }
  }

  return json({ message: GENERIC_MESSAGE });
};
