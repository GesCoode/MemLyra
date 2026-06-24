import { listMarketplaceDecks } from '$lib/server/marketplace';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const listings = await listMarketplaceDecks();
  return { listings };
};
