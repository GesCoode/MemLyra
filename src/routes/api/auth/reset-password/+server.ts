import { json, type RequestHandler } from '@sveltejs/kit';
import { resetPasswordWithToken } from '$lib/server/auth';
import { validatePassword } from '$lib/utils/passwordPolicy';

export const POST: RequestHandler = async ({ request }) => {
  let body: { token?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const token = body.token?.trim() ?? '';
  const password = body.password ?? '';

  if (!token) {
    return json({ error: 'Missing reset token.' }, { status: 400 });
  }

  if (!password) {
    return json({ error: 'Enter a new password.' }, { status: 400 });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return json({ error: passwordError }, { status: 400 });
  }

  const updated = await resetPasswordWithToken(token, password);
  if (!updated) {
    return json({ error: 'This reset link is invalid or has expired.' }, { status: 400 });
  }

  return json({ message: 'Password updated. You can sign in with your new password.' });
};
