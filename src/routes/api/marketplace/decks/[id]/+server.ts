import { json, type RequestHandler } from '@sveltejs/kit';
import {
  getMarketplaceDeck,
  toOwnerSummary,
  toPublicDetail,
  unpublishMarketplaceDeck,
  updateMarketplaceListingMetadata
} from '$lib/server/marketplace';
import { checkRateLimit, rateLimitKey } from '$lib/server/rateLimit';

export const GET: RequestHandler = async ({ locals, params }) => {
  const deck = await getMarketplaceDeck(params.id ?? '', locals.user?.id ?? null);
  if (!deck) {
    return json({ error: 'Deck not found.' }, { status: 404 });
  }

  const isOwner = locals.user?.id === deck.publisherUserId;
  return json({ deck: isOwner ? toOwnerSummary(deck) : toPublicDetail(deck) });
};

export const PATCH: RequestHandler = async ({ locals, request, params, getClientAddress }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const ip = getClientAddress();
  if (!(await checkRateLimit(rateLimitKey('marketplace-update', ip, locals.user.id), 30, 60 * 60 * 1000))) {
    return json({ error: 'Too many update attempts. Try again later.' }, { status: 429 });
  }

  let body: { title?: string; description?: string };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    const deck = await updateMarketplaceListingMetadata(
      locals.user.id,
      params.id ?? '',
      body.title?.trim() ?? '',
      body.description?.trim() ?? ''
    );
    return json({ deck: toOwnerSummary(deck) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update listing.';
    return json({ error: message }, { status: 400 });
  }
};

export const DELETE: RequestHandler = async ({ locals, params, getClientAddress }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const ip = getClientAddress();
  if (!(await checkRateLimit(rateLimitKey('marketplace-unpublish', ip, locals.user.id), 20, 60 * 60 * 1000))) {
    return json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  const removed = await unpublishMarketplaceDeck(locals.user.id, params.id ?? '');
  if (!removed) {
    return json({ error: 'Could not remove listing.' }, { status: 404 });
  }

  return json({ ok: true });
};
