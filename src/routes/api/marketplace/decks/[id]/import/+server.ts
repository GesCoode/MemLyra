import { json, type RequestHandler } from '@sveltejs/kit';
import { importMarketplaceDeckForUser } from '$lib/server/marketplace';
import { checkRateLimit, rateLimitKey } from '$lib/server/rateLimit';

export const POST: RequestHandler = async ({ locals, request, params, getClientAddress }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const ip = getClientAddress();
  if (!(await checkRateLimit(rateLimitKey('marketplace-import', ip, locals.user.id), 30, 60 * 60 * 1000))) {
    return json({ error: 'Too many import attempts. Try again later.' }, { status: 429 });
  }

  let body: { deckName?: string };

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const payload = await importMarketplaceDeckForUser(
      locals.user.id,
      params.id ?? '',
      body.deckName?.trim() ?? ''
    );
    return json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not import deck.';
    return json({ error: message }, { status: 400 });
  }
};
