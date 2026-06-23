import { json, type RequestHandler } from '@sveltejs/kit';
import { getMarketplaceDeck, unpublishMarketplaceDeck } from '$lib/server/marketplace';

export const GET: RequestHandler = async ({ locals, params }) => {
  const deck = await getMarketplaceDeck(params.id ?? '', locals.user?.id ?? null);
  if (!deck) {
    return json({ error: 'Deck not found.' }, { status: 404 });
  }

  return json({ deck });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const removed = await unpublishMarketplaceDeck(locals.user.id, params.id ?? '');
  if (!removed) {
    return json({ error: 'Could not remove listing.' }, { status: 404 });
  }

  return json({ ok: true });
};
