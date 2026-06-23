import { json, type RequestHandler } from '@sveltejs/kit';
import { importGuestBundleForUser, type GuestMigrationPayload } from '$lib/server/guestMigration';
import { stripGuestStarterPreset } from '$lib/utils/guestStarterPreset';

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let body: GuestMigrationPayload;

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (body.version !== 1 || !Array.isArray(body.decks) || !Array.isArray(body.tags) || !Array.isArray(body.flashcards)) {
    return json({ error: 'Invalid guest data.' }, { status: 400 });
  }

  const result = await importGuestBundleForUser(locals.user.id, stripGuestStarterPreset(body));
  return json({ result });
};
