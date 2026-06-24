import { createDeckForUser, listDecksForUser } from '$lib/server/decks';
import { getSql } from '$lib/server/db';
import {
  importFlashcardRowsForUser,
  listFlashcardsForUser,
  type ImportResult
} from '$lib/server/flashcards';
import { listTagsForUser } from '$lib/server/tags';
import type {
  MarketplaceCard,
  MarketplaceDeckDetail,
  MarketplaceDeckSummary
} from '$lib/utils/marketplace';
import { marketplaceCardsToImportRows } from '$lib/utils/marketplace';
import { slugifyMarketplaceTitle } from '$lib/utils/marketplaceSlug';
import { LIMITS, trimToMax } from '$lib/server/limits';

export type { MarketplaceCard, MarketplaceDeckDetail, MarketplaceDeckSummary };
export { marketplaceCardsToImportRows };

export type PublishMarketplaceDeckResult = {
  deck: MarketplaceDeckSummary;
  updated: boolean;
};

type MarketplaceDeckRow = {
  id: string;
  slug: string;
  publisher_user_id: string;
  source_deck_id: string | null;
  title: string;
  description: string;
  color: string;
  card_count: number;
  rating_sum: number | string;
  rating_count: number | string;
  published_at: Date;
  updated_at: Date;
  publisher_name: string;
};

type MarketplaceCardRow = {
  side_a: string;
  side_b: string;
  tag_labels: string[];
  sort_order: number;
};

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === 'number' ? value : Number(value);
}

function toSummary(row: MarketplaceDeckRow): MarketplaceDeckSummary {
  const ratingCount = toNumber(row.rating_count);
  const averageRating = ratingCount > 0 ? toNumber(row.rating_sum) / ratingCount : 0;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    color: row.color,
    cardCount: row.card_count,
    publishedAt: row.published_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    publisherName: row.publisher_name,
    publisherUserId: row.publisher_user_id,
    sourceDeckId: row.source_deck_id,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingCount
  };
}

export function toPublicSummary(deck: MarketplaceDeckSummary): MarketplaceDeckSummary {
  return {
    id: deck.id,
    slug: deck.slug,
    title: deck.title,
    description: deck.description,
    color: deck.color,
    cardCount: deck.cardCount,
    publishedAt: deck.publishedAt,
    updatedAt: deck.updatedAt,
    publisherName: deck.publisherName,
    publisherUserId: '',
    sourceDeckId: null,
    averageRating: deck.averageRating,
    ratingCount: deck.ratingCount
  };
}

export function toPublicDetail(deck: MarketplaceDeckDetail): MarketplaceDeckDetail {
  return {
    ...toPublicSummary(deck),
    cards: deck.cards,
    userRating: deck.userRating
  };
}

export function toOwnerSummary(deck: MarketplaceDeckSummary): MarketplaceDeckSummary {
  return deck;
}

function toCard(row: MarketplaceCardRow): MarketplaceCard {
  return {
    sideA: row.side_a,
    sideB: row.side_b,
    tagLabels: Array.isArray(row.tag_labels) ? row.tag_labels : []
  };
}

async function deckOwnedByUser(
  userId: string,
  deckId: string
): Promise<{ label: string; color: string } | null> {
  const sql = getSql();
  const rows = await sql<{ label: string; color: string }[]>`
    SELECT label, color
    FROM decks
    WHERE id = ${deckId}
      AND user_id = ${userId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

async function cardsForDeckSnapshot(userId: string, deckId: string): Promise<MarketplaceCard[]> {
  const sql = getSql();
  const rows = await sql<{ side_a: string; side_b: string; tag_labels: string[] }[]>`
    SELECT
      f.side_a,
      f.side_b,
      COALESCE(
        json_agg(DISTINCT t.label) FILTER (WHERE t.label IS NOT NULL),
        '[]'::json
      ) AS tag_labels
    FROM flashcards f
    LEFT JOIN flashcard_tags ft ON ft.flashcard_id = f.id
    LEFT JOIN tags t ON t.id = ft.tag_id
    WHERE f.user_id = ${userId}
      AND f.deck_id = ${deckId}
    GROUP BY f.id, f.side_a, f.side_b, f.added_at
    ORDER BY f.added_at ASC
  `;

  return rows.map((row) => ({
    sideA: row.side_a,
    sideB: row.side_b,
    tagLabels: Array.isArray(row.tag_labels) ? row.tag_labels : []
  }));
}

async function getUserRating(
  marketplaceDeckId: string,
  userId: string | null | undefined
): Promise<number | null> {
  if (!userId) return null;

  const sql = getSql();
  const rows = await sql<{ rating: number }[]>`
    SELECT rating
    FROM marketplace_ratings
    WHERE marketplace_deck_id = ${marketplaceDeckId}
      AND user_id = ${userId}
    LIMIT 1
  `;

  return rows[0]?.rating ?? null;
}

async function isSlugTaken(slug: string, excludeDeckId?: string): Promise<boolean> {
  const sql = getSql();
  const rows = excludeDeckId
    ? await sql<{ id: string }[]>`
        SELECT id
        FROM marketplace_decks
        WHERE slug = ${slug}
          AND id <> ${excludeDeckId}
        LIMIT 1
      `
    : await sql<{ id: string }[]>`
        SELECT id
        FROM marketplace_decks
        WHERE slug = ${slug}
        LIMIT 1
      `;

  return rows.length > 0;
}

async function allocateMarketplaceSlug(title: string, excludeDeckId?: string): Promise<string> {
  const base = slugifyMarketplaceTitle(title);
  let candidate = base;
  let suffix = 2;

  while (await isSlugTaken(candidate, excludeDeckId)) {
    candidate = `${base}${suffix}`;
    suffix += 1;
  }

  return candidate;
}

type SitemapDeckEntry = {
  slug: string;
  updatedAt: string;
};

let sitemapCache: { decks: SitemapDeckEntry[]; expiresAt: number } | null = null;
const SITEMAP_CACHE_TTL_MS = 60 * 60 * 1000;

export function invalidateMarketplaceListCache(): void {
  sitemapCache = null;
}

export async function listMarketplaceDecksForSitemap(): Promise<SitemapDeckEntry[]> {
  if (sitemapCache && Date.now() < sitemapCache.expiresAt) {
    return sitemapCache.decks;
  }

  const sql = getSql();
  const rows = await sql<{ slug: string; updated_at: Date }[]>`
    SELECT slug, updated_at
    FROM marketplace_decks
    WHERE is_listed = TRUE
    ORDER BY published_at DESC
  `;

  const decks = rows.map((row) => ({
    slug: row.slug,
    updatedAt: row.updated_at.toISOString()
  }));

  sitemapCache = { decks, expiresAt: Date.now() + SITEMAP_CACHE_TTL_MS };
  return decks;
}

export async function listMarketplaceDecks(): Promise<MarketplaceDeckSummary[]> {
  const sql = getSql();
  const rows = await sql<MarketplaceDeckRow[]>`
    SELECT
      md.id,
      md.slug,
      md.publisher_user_id,
      md.source_deck_id,
      md.title,
      md.description,
      md.color,
      md.card_count,
      md.rating_sum,
      md.rating_count,
      md.published_at,
      md.updated_at,
      u.name AS publisher_name
    FROM marketplace_decks md
    JOIN users u ON u.id = md.publisher_user_id
    WHERE md.is_listed = TRUE
    ORDER BY md.published_at DESC
  `;

  return rows.map(toSummary);
}

export async function listPublishedDecksForUser(userId: string): Promise<MarketplaceDeckSummary[]> {
  const sql = getSql();
  const rows = await sql<MarketplaceDeckRow[]>`
    SELECT
      md.id,
      md.slug,
      md.publisher_user_id,
      md.source_deck_id,
      md.title,
      md.description,
      md.color,
      md.card_count,
      md.rating_sum,
      md.rating_count,
      md.published_at,
      md.updated_at,
      u.name AS publisher_name
    FROM marketplace_decks md
    JOIN users u ON u.id = md.publisher_user_id
    WHERE md.publisher_user_id = ${userId}
      AND md.is_listed = TRUE
    ORDER BY md.updated_at DESC
  `;

  return rows.map(toSummary);
}

export async function getMarketplaceDeck(
  slugOrId: string,
  viewerUserId?: string | null
): Promise<MarketplaceDeckDetail | null> {
  const sql = getSql();
  const deckRows = await sql<MarketplaceDeckRow[]>`
    SELECT
      md.id,
      md.slug,
      md.publisher_user_id,
      md.source_deck_id,
      md.title,
      md.description,
      md.color,
      md.card_count,
      md.rating_sum,
      md.rating_count,
      md.published_at,
      md.updated_at,
      u.name AS publisher_name
    FROM marketplace_decks md
    JOIN users u ON u.id = md.publisher_user_id
    WHERE md.is_listed = TRUE
      AND (md.slug = ${slugOrId} OR md.id::text = ${slugOrId})
    LIMIT 1
  `;

  const deck = deckRows[0];
  if (!deck) return null;

  const cardRows = await sql<MarketplaceCardRow[]>`
    SELECT side_a, side_b, tag_labels, sort_order
    FROM marketplace_cards
    WHERE marketplace_deck_id = ${deck.id}
    ORDER BY sort_order ASC
  `;

  const userRating = await getUserRating(deck.id, viewerUserId);

  return {
    ...toSummary(deck),
    cards: cardRows.map(toCard),
    userRating
  };
}

export async function publishDeckToMarketplace(
  userId: string,
  sourceDeckId: string,
  title: string,
  description = ''
): Promise<PublishMarketplaceDeckResult> {
  const sql = getSql();
  const deck = await deckOwnedByUser(userId, sourceDeckId);
  if (!deck) {
    throw new Error('Deck not found.');
  }

  const marketplaceTitle = trimToMax(title || deck.label, LIMITS.maxMarketplaceTitle);
  if (!marketplaceTitle) {
    throw new Error('Enter a marketplace name for this deck.');
  }

  const cards = await cardsForDeckSnapshot(userId, sourceDeckId);
  if (cards.length === 0) {
    throw new Error('Add cards to this deck before publishing.');
  }

  if (cards.length > LIMITS.maxMarketplaceCards) {
    throw new Error(`Marketplace decks are limited to ${LIMITS.maxMarketplaceCards} cards.`);
  }

  const trimmedDescription = trimToMax(description, LIMITS.maxMarketplaceDescription);
  const existing = await sql<{ id: string }[]>`
    SELECT id
    FROM marketplace_decks
    WHERE publisher_user_id = ${userId}
      AND source_deck_id = ${sourceDeckId}
      AND is_listed = TRUE
    LIMIT 1
  `;

  const updated = Boolean(existing[0]?.id);
  let marketplaceDeckId = existing[0]?.id;
  const slug = await allocateMarketplaceSlug(marketplaceTitle, marketplaceDeckId);

  await sql.begin(async (tx) => {
    if (marketplaceDeckId) {
      await tx`
        UPDATE marketplace_decks
        SET
          title = ${marketplaceTitle},
          slug = ${slug},
          description = ${trimmedDescription},
          color = ${deck.color},
          card_count = ${cards.length},
          updated_at = NOW()
        WHERE id = ${marketplaceDeckId}
      `;
      await tx`DELETE FROM marketplace_cards WHERE marketplace_deck_id = ${marketplaceDeckId}`;
    } else {
      const inserted = await tx<{ id: string }[]>`
        INSERT INTO marketplace_decks (
          publisher_user_id,
          source_deck_id,
          title,
          slug,
          description,
          color,
          card_count
        )
        VALUES (
          ${userId},
          ${sourceDeckId},
          ${marketplaceTitle},
          ${slug},
          ${trimmedDescription},
          ${deck.color},
          ${cards.length}
        )
        RETURNING id
      `;
      marketplaceDeckId = inserted[0].id;
    }

    for (const [index, card] of cards.entries()) {
      await tx`
        INSERT INTO marketplace_cards (marketplace_deck_id, side_a, side_b, tag_labels, sort_order)
        VALUES (
          ${marketplaceDeckId},
          ${trimToMax(card.sideA, LIMITS.maxCardSideLength)},
          ${trimToMax(card.sideB, LIMITS.maxCardSideLength)},
          ${tx.json(card.tagLabels)},
          ${index}
        )
      `;
    }
  });

  const published = await getMarketplaceDeck(marketplaceDeckId!, userId);
  if (!published) {
    throw new Error('Could not publish deck.');
  }

  invalidateMarketplaceListCache();
  return { deck: published, updated };
}

export async function updateMarketplaceListingMetadata(
  userId: string,
  marketplaceDeckId: string,
  title: string,
  description = ''
): Promise<MarketplaceDeckSummary> {
  const sql = getSql();
  const marketplaceTitle = trimToMax(title, LIMITS.maxMarketplaceTitle);
  if (!marketplaceTitle) {
    throw new Error('Enter a marketplace name for this deck.');
  }

  const trimmedDescription = trimToMax(description, LIMITS.maxMarketplaceDescription);
  const slug = await allocateMarketplaceSlug(marketplaceTitle, marketplaceDeckId);

  const rows = await sql<{ id: string }[]>`
    UPDATE marketplace_decks
    SET
      title = ${marketplaceTitle},
      slug = ${slug},
      description = ${trimmedDescription},
      updated_at = NOW()
    WHERE id = ${marketplaceDeckId}
      AND publisher_user_id = ${userId}
      AND is_listed = TRUE
    RETURNING id
  `;

  if (!rows[0]) {
    throw new Error('Listing not found.');
  }

  const deck = await getMarketplaceDeck(marketplaceDeckId, userId);
  if (!deck) {
    throw new Error('Could not update listing.');
  }

  invalidateMarketplaceListCache();
  return deck;
}

export async function rateMarketplaceDeck(
  userId: string,
  marketplaceDeckId: string,
  rating: number
): Promise<MarketplaceDeckSummary> {
  const sql = getSql();
  const normalizedRating = Math.round(rating);

  if (normalizedRating < 1 || normalizedRating > 5) {
    throw new Error('Choose a rating between 1 and 5 stars.');
  }

  const deckExists = await sql<{ id: string }[]>`
    SELECT id
    FROM marketplace_decks
    WHERE id = ${marketplaceDeckId}
      AND is_listed = TRUE
    LIMIT 1
  `;

  if (!deckExists[0]) {
    throw new Error('Marketplace deck not found.');
  }

  await sql`
    INSERT INTO marketplace_ratings (marketplace_deck_id, user_id, rating)
    VALUES (${marketplaceDeckId}, ${userId}, ${normalizedRating})
    ON CONFLICT (marketplace_deck_id, user_id)
    DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
  `;

  const deck = await getMarketplaceDeck(marketplaceDeckId, userId);
  if (!deck) {
    throw new Error('Could not save rating.');
  }

  invalidateMarketplaceListCache();
  return deck;
}

export async function unpublishMarketplaceDeck(userId: string, marketplaceDeckId: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql<{ id: string }[]>`
    UPDATE marketplace_decks
    SET is_listed = FALSE, updated_at = NOW()
    WHERE id = ${marketplaceDeckId}
      AND publisher_user_id = ${userId}
    RETURNING id
  `;

  const removed = rows.length > 0;
  if (removed) {
    invalidateMarketplaceListCache();
  }

  return removed;
}

async function createImportDeckForUser(
  userId: string,
  requestedName: string,
  color: string
): Promise<string> {
  const trimmed = requestedName.trim();
  if (!trimmed) {
    throw new Error('Enter a name for your imported deck.');
  }

  const decks = await listDecksForUser(userId);
  if (decks.some((deck) => deck.label.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error('You already have a deck with this name. Choose a different name.');
  }

  const created = await createDeckForUser(userId, trimmed, color);
  return created.id;
}

export async function importMarketplaceDeckForUser(
  userId: string,
  marketplaceDeckId: string,
  deckName: string
): Promise<{
  result: ImportResult;
  flashcards: Awaited<ReturnType<typeof listFlashcardsForUser>>;
  tags: Awaited<ReturnType<typeof listTagsForUser>>;
  decks: Awaited<ReturnType<typeof listDecksForUser>>;
}> {
  const marketplaceDeck = await getMarketplaceDeck(marketplaceDeckId);
  if (!marketplaceDeck) {
    throw new Error('Marketplace deck not found.');
  }

  const importName = deckName.trim() || marketplaceDeck.title;
  const deckId = await createImportDeckForUser(userId, importName, marketplaceDeck.color);

  const result = await importFlashcardRowsForUser(
    userId,
    marketplaceCardsToImportRows(marketplaceDeck.cards),
    deckId
  );

  const [flashcards, tags, decks] = await Promise.all([
    listFlashcardsForUser(userId),
    listTagsForUser(userId),
    listDecksForUser(userId)
  ]);

  return { result, flashcards, tags, decks };
}
