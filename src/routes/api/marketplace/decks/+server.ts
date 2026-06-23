import { json, type RequestHandler } from '@sveltejs/kit';
import {
  listMarketplaceDecks,
  listPublishedDecksForUser,
  publishDeckToMarketplace
} from '$lib/server/marketplace';

export const GET: RequestHandler = async ({ locals, url }) => {
  const mine = url.searchParams.get('mine') === 'true';

  if (mine) {
    if (!locals.user) {
      return json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const decks = await listPublishedDecksForUser(locals.user.id);
    return json({ decks });
  }

  const decks = await listMarketplaceDecks();
  return json({ decks });
};

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
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
    const deck = await publishDeckToMarketplace(
      locals.user.id,
      deckId,
      body.title?.trim() ?? '',
      body.description?.trim() ?? ''
    );
    return json({ deck });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not publish deck.';
    return json({ error: message }, { status: 400 });
  }
};
