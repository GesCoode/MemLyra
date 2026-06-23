import { json, type RequestHandler } from '@sveltejs/kit';
import { importMarketplaceDeckForUser } from '$lib/server/marketplace';

export const POST: RequestHandler = async ({ locals, request, params }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
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
