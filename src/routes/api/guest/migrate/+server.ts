import { json, type RequestHandler } from '@sveltejs/kit';
import { importGuestBundleForUser, type GuestMigrationPayload } from '$lib/server/guestMigration';
import { LIMITS } from '$lib/server/limits';
import { checkRateLimit, rateLimitKey } from '$lib/server/rateLimit';
import { stripGuestStarterPreset } from '$lib/utils/guestStarterPreset';

export const POST: RequestHandler = async ({ locals, request, getClientAddress }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const ip = getClientAddress();
  if (!(await checkRateLimit(rateLimitKey('guest-migrate', ip, locals.user.id), 5, 60 * 60 * 1000))) {
    return json({ error: 'Too many migration attempts. Try again later.' }, { status: 429 });
  }

  const rawBody = await request.text();
  if (rawBody.length > LIMITS.maxGuestPayloadBytes) {
    return json({ error: 'Guest data payload is too large.' }, { status: 413 });
  }

  let body: GuestMigrationPayload;

  try {
    body = JSON.parse(rawBody) as GuestMigrationPayload;
  } catch {
    return json({ error: 'Invalid guest data.' }, { status: 400 });
  }

  if (
    body.version !== 1 ||
    !Array.isArray(body.decks) ||
    !Array.isArray(body.tags) ||
    !Array.isArray(body.flashcards)
  ) {
    return json({ error: 'Invalid guest data.' }, { status: 400 });
  }

  if (
    body.decks.length > LIMITS.maxGuestDecks ||
    body.tags.length > LIMITS.maxGuestTags ||
    body.flashcards.length > LIMITS.maxGuestFlashcards
  ) {
    return json({ error: 'Guest data exceeds allowed limits.' }, { status: 400 });
  }

  const result = await importGuestBundleForUser(locals.user.id, stripGuestStarterPreset(body));
  return json({ result });
};
