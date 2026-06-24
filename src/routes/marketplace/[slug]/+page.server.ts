import { redirect, error } from '@sveltejs/kit';
import { getMarketplaceDeck } from '$lib/server/marketplace';
import { marketplaceDeckPath } from '$lib/utils/marketplace';
import type { PageServerLoad } from './$types';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const load: PageServerLoad = async ({ params, locals, url }) => {
  const deck = await getMarketplaceDeck(params.slug, locals.user?.id ?? null);

  if (!deck) {
    error(404, 'Deck not found');
  }

  if (UUID_PATTERN.test(params.slug) && params.slug !== deck.slug) {
    redirect(301, `${marketplaceDeckPath(deck)}${url.search}`);
  }

  return { deck, user: locals.user };
};
