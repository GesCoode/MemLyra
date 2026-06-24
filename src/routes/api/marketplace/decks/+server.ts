import { json, type RequestHandler } from '@sveltejs/kit';
import {
  listMarketplaceDecks,
  listPublishedDecksForUser,
  publishDeckToMarketplace,
  toOwnerSummary,
  toPublicSummary
} from '$lib/server/marketplace';
import { checkRateLimit, rateLimitKey } from '$lib/server/rateLimit';

export const GET: RequestHandler = async ({ locals, url }) => {
  const mine = url.searchParams.get('mine') === 'true';

  if (mine) {
    if (!locals.user) {
      return json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const decks = await listPublishedDecksForUser(locals.user.id);
    return json({ decks: decks.map(toOwnerSummary) });
  }

  const decks = await listMarketplaceDecks();
  return json({ decks: decks.map(toPublicSummary) });
};

export const POST: RequestHandler = async ({ locals, request, getClientAddress }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const ip = getClientAddress();
  if (!(await checkRateLimit(rateLimitKey('marketplace-publish', ip, locals.user.id), 20, 60 * 60 * 1000))) {
    return json({ error: 'Too many publish attempts. Try again later.' }, { status: 429 });
  }

  let body: { deckId?: string; title?: string; description?: string };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const deckId = body.deckId?.trim() ?? '';
  if (!deckId) {
    return json({ error: 'Select a deck to publish.' }, { status: 400 });
  }

  try {
    const result = await publishDeckToMarketplace(
      locals.user.id,
      deckId,
      body.title?.trim() ?? '',
      body.description?.trim() ?? ''
    );
    return json({ deck: toOwnerSummary(result.deck), updated: result.updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not publish deck.';
    return json({ error: message }, { status: 400 });
  }
};
