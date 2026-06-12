import { json, type RequestHandler } from '@sveltejs/kit';
import { updateUserPassword } from '$lib/server/auth';
import { validatePassword } from '$lib/utils/passwordPolicy';

export const PATCH: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const currentPassword = body.currentPassword ?? '';
  const newPassword = body.newPassword ?? '';

  if (!currentPassword || !newPassword) {
    return json({ error: 'Enter your current password and a new password.' }, { status: 400 });
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    return json({ error: passwordError }, { status: 400 });
  }

  if (currentPassword === newPassword) {
    return json({ error: 'Choose a different password than your current one.' }, { status: 400 });
  }

  const updated = await updateUserPassword(locals.user.id, currentPassword, newPassword);
  if (!updated) {
    return json({ error: 'Current password is incorrect.' }, { status: 401 });
  }

  return json({ message: 'Password updated.' });
};
