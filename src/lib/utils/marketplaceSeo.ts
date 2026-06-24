import { APP_NAME, APP_URL } from '$lib/app';
import type { MarketplaceDeckDetail, MarketplaceDeckSummary } from '$lib/utils/marketplace';
import { marketplaceDeckPath } from '$lib/utils/marketplace';
import { buildBreadcrumbJsonLd, jsonLdScript, truncateDescription, resolveSiteUrl } from '$lib/utils/seo';

export { buildBreadcrumbJsonLd, jsonLdScript };

export function marketplaceIndexPath(): string {
  return '/marketplace';
}

export function marketplaceDeckUrl(
  deck: Pick<MarketplaceDeckSummary, 'slug'> | string,
  siteUrl?: string
): string {
  const base = resolveSiteUrl(siteUrl);
  return `${base}${marketplaceDeckPath(deck)}`;
}

export function marketplaceIndexUrl(siteUrl?: string): string {
  const base = resolveSiteUrl(siteUrl);
  return `${base}${marketplaceIndexPath()}`;
}

export function buildMarketplaceDeckTitle(
  deck: Pick<MarketplaceDeckSummary, 'title' | 'cardCount'>
): string {
  return `${deck.title} — ${deck.cardCount} flashcard${deck.cardCount === 1 ? '' : 's'} · ${APP_NAME}`;
}

export function buildMarketplaceDeckDescription(deck: MarketplaceDeckSummary): string {
  const parts = [
    `Study ${deck.cardCount} flashcards in "${deck.title}" by ${deck.publisherName}.`
  ];

  if (deck.description.trim()) {
    parts.push(deck.description.trim());
  }

  parts.push('Import this deck into MemLyra and start practicing for free.');
  return truncateDescription(parts.join(' '));
}

export function buildMarketplaceIndexTitle(): string {
  return `Free flashcard deck marketplace · ${APP_NAME}`;
}

export function buildMarketplaceIndexDescription(): string {
  return 'Browse free flashcard decks shared by the MemLyra community. Preview cards, read ratings, and import decks into your library to start practicing.';
}

export function formatMarketplaceDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function buildMarketplaceDeckJsonLd(deck: MarketplaceDeckDetail, siteUrl?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: deck.title,
    description: deck.description.trim() || buildMarketplaceDeckDescription(deck),
    url: marketplaceDeckUrl(deck, siteUrl),
    datePublished: deck.publishedAt,
    dateModified: deck.updatedAt,
    author: {
      '@type': 'Person',
      name: deck.publisherName
    },
    learningResourceType: 'flashcard deck',
    educationalLevel: 'beginner',
    ...(deck.ratingCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: deck.averageRating,
            ratingCount: deck.ratingCount,
            bestRating: 5,
            worstRating: 1
          }
        }
      : {}),
    provider: {
      '@type': 'Organization',
      name: APP_NAME,
      url: resolveSiteUrl(siteUrl)
    }
  };
}

export function buildMarketplaceIndexJsonLd(
  decks: MarketplaceDeckSummary[],
  siteUrl?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: buildMarketplaceIndexTitle(),
    description: buildMarketplaceIndexDescription(),
    url: marketplaceIndexUrl(siteUrl),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: decks.length,
      itemListElement: decks.slice(0, 50).map((deck, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: marketplaceDeckUrl(deck, siteUrl),
        name: deck.title
      }))
    }
  };
}
