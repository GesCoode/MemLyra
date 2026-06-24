import { json, type RequestHandler } from '@sveltejs/kit';
import { rateMarketplaceDeck, toPublicSummary } from '$lib/server/marketplace';
import { checkRateLimit, rateLimitKey } from '$lib/server/rateLimit';

export const POST: RequestHandler = async ({ locals, request, params, getClientAddress }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const ip = getClientAddress();
  if (!(await checkRateLimit(rateLimitKey('marketplace-rate', ip, locals.user.id), 30, 60 * 60 * 1000))) {
    return json({ error: 'Too many ratings. Try again later.' }, { status: 429 });
  }

  let body: { rating?: number };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const rating = Number(body.rating);
  if (!Number.isFinite(rating)) {
    return json({ error: 'Choose a rating between 1 and 5 stars.' }, { status: 400 });
  }

  try {
    const deck = await rateMarketplaceDeck(locals.user.id, params.id ?? '', rating);
    return json({ deck: toPublicSummary(deck) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save rating.';
    return json({ error: message }, { status: 400 });
  }
};
