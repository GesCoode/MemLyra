import { json, type RequestHandler } from '@sveltejs/kit';
import {
  createPasswordResetToken,
  createVerificationToken,
  findUserByEmail
} from '$lib/server/auth';
import { sendPasswordResetEmail, sendVerificationEmail } from '$lib/server/mail';
import { getAppOrigin } from '$lib/server/origin';

const GENERIC_MESSAGE =
  'If an account exists for that email, a password reset link has been sent.';

const GENERIC_VERIFICATION_MESSAGE =
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
  if (account) {
    try {
      if (account.email_verified) {
        const resetToken = await createPasswordResetToken(account.id);
        const resetUrl = `${getAppOrigin(url)}/reset-password?token=${resetToken}`;
        const emailSent = await sendPasswordResetEmail(account.email, resetUrl);

        if (!emailSent) {
          return json(
            {
              error:
                'Email is not configured on the server yet. Contact support to reset your password.'
            },
            { status: 503 }
          );
        }
      } else {
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

        return json({ message: GENERIC_VERIFICATION_MESSAGE });
      }
    } catch (error) {
      console.error('Failed to send account recovery email', error);
      return json(
        { error: 'Could not send email right now. Please try again later or contact support.' },
        { status: 503 }
      );
    }
  }

  return json({ message: GENERIC_MESSAGE });
};
