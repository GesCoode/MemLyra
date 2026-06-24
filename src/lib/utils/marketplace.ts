export type MarketplaceDeckSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  color: string;
  cardCount: number;
  publishedAt: string;
  updatedAt: string;
  publisherName: string;
  publisherUserId: string;
  sourceDeckId: string | null;
  averageRating: number;
  ratingCount: number;
};

export type MarketplaceCard = {
  sideA: string;
  sideB: string;
  tagLabels: string[];
};

export type MarketplaceDeckDetail = MarketplaceDeckSummary & {
  cards: MarketplaceCard[];
  userRating: number | null;
};

export const MARKETPLACE_PREVIEW_CARD_COUNT = 5;

export function marketplaceDeckPath(deck: Pick<MarketplaceDeckSummary, 'slug'> | string): string {
  const slug = typeof deck === 'string' ? deck : deck.slug;
  return `/marketplace/${slug}`;
}

export function marketplaceCardsToImportRows(cards: MarketplaceCard[] | undefined) {
  return (cards ?? []).map((card) => ({
    front: card.sideA,
    back: card.sideB,
    tagLabels: card.tagLabels
  }));
}

export function formatMarketplaceRating(averageRating: number, ratingCount: number): string {
  if (ratingCount === 0) return 'No ratings yet';
  return `${averageRating.toFixed(1)} · ${ratingCount} rating${ratingCount === 1 ? '' : 's'}`;
}

export type MarketplaceSortField = 'date' | 'cards' | 'rating' | 'name';
export type MarketplaceSortDirection = 'asc' | 'desc';

export function filterMarketplaceDecks(
  decks: MarketplaceDeckSummary[],
  query: string
): MarketplaceDeckSummary[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return decks;

  return decks.filter(
    (deck) =>
      deck.title.toLowerCase().includes(normalized) ||
      deck.slug.toLowerCase().includes(normalized) ||
      deck.description.toLowerCase().includes(normalized) ||
      deck.publisherName.toLowerCase().includes(normalized)
  );
}

export function sortMarketplaceDecks(
  decks: MarketplaceDeckSummary[],
  field: MarketplaceSortField,
  direction: MarketplaceSortDirection
): MarketplaceDeckSummary[] {
  const sorted = [...decks].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'date':
        comparison =
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        break;
      case 'cards':
        comparison = a.cardCount - b.cardCount;
        break;
      case 'rating':
        comparison =
          a.averageRating - b.averageRating || a.ratingCount - b.ratingCount;
        break;
      case 'name':
        comparison = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        break;
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}
