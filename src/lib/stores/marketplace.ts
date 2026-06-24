import { decks } from '$lib/stores/decks';
import type { ImportResult } from '$lib/stores/flashcards';
import { flashcards } from '$lib/stores/flashcards';
import { tags } from '$lib/stores/tags';
import type { MarketplaceDeckDetail, MarketplaceDeckSummary } from '$lib/utils/marketplace';
import { marketplaceCardsToImportRows } from '$lib/utils/marketplace';
import { guestActive, runGuestMutation } from '$lib/utils/guestStoreBridge';
import { guestCreateDeck, guestImportRows, readGuestData } from '$lib/utils/guestStorage';
import { isDeckNameTaken } from '$lib/stores/decks';

export type { MarketplaceDeckDetail, MarketplaceDeckSummary };

export async function fetchMarketplaceDecks(): Promise<MarketplaceDeckSummary[]> {
  const response = await fetch('/api/marketplace/decks');
  if (!response.ok) return [];

  const data = (await response.json()) as { decks: MarketplaceDeckSummary[] };
  return data.decks ?? [];
}

export async function fetchMyMarketplaceListings(): Promise<MarketplaceDeckSummary[]> {
  const response = await fetch('/api/marketplace/decks?mine=true');
  if (!response.ok) return [];

  const data = (await response.json()) as { decks: MarketplaceDeckSummary[] };
  return data.decks ?? [];
}

export async function fetchMarketplaceDeck(deckId: string): Promise<MarketplaceDeckDetail | null> {
  const response = await fetch(`/api/marketplace/decks/${encodeURIComponent(deckId)}`);
  if (!response.ok) return null;

  const data = (await response.json()) as { deck: MarketplaceDeckDetail };
  return data.deck ?? null;
}

export async function publishDeckToMarketplace(
  deckId: string,
  title: string,
  description = ''
): Promise<{ deck?: MarketplaceDeckSummary; updated?: boolean; error?: string }> {
  const response = await fetch('/api/marketplace/decks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deckId, title, description })
  });

  const data = (await response.json()) as {
    deck?: MarketplaceDeckSummary;
    updated?: boolean;
    error?: string;
  };
  if (!response.ok) {
    return { error: data.error ?? 'Could not publish deck.' };
  }

  return { deck: data.deck, updated: data.updated };
}

export async function updateMarketplaceListing(
  marketplaceDeckId: string,
  title: string,
  description = ''
): Promise<{ deck?: MarketplaceDeckSummary; error?: string }> {
  const response = await fetch(`/api/marketplace/decks/${encodeURIComponent(marketplaceDeckId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  });

  const data = (await response.json()) as { deck?: MarketplaceDeckSummary; error?: string };
  if (!response.ok) {
    return { error: data.error ?? 'Could not update listing.' };
  }

  return { deck: data.deck };
}

export async function republishMarketplaceListing(
  sourceDeckId: string,
  title: string,
  description = ''
): Promise<{ deck?: MarketplaceDeckSummary; updated?: boolean; error?: string }> {
  return publishDeckToMarketplace(sourceDeckId, title, description);
}

export async function rateMarketplaceDeck(
  marketplaceDeckId: string,
  rating: number
): Promise<{ deck?: MarketplaceDeckSummary; error?: string }> {
  const response = await fetch(
    `/api/marketplace/decks/${encodeURIComponent(marketplaceDeckId)}/rate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating })
    }
  );

  const data = (await response.json()) as { deck?: MarketplaceDeckSummary; error?: string };
  if (!response.ok) {
    return { error: data.error ?? 'Could not save rating.' };
  }

  return { deck: data.deck };
}

export async function unpublishMarketplaceDeck(marketplaceDeckId: string): Promise<boolean> {
  const response = await fetch(`/api/marketplace/decks/${encodeURIComponent(marketplaceDeckId)}`, {
    method: 'DELETE'
  });

  return response.ok;
}

export async function importMarketplaceDeck(
  marketplaceDeckId: string,
  deckName: string
): Promise<ImportResult & { error?: string; deckName?: string }> {
  const deck = await fetchMarketplaceDeck(marketplaceDeckId);
  if (!deck) {
    return {
      imported: 0,
      skipped: 0,
      errors: ['Marketplace deck not found.'],
      error: 'Marketplace deck not found.'
    };
  }

  const importName = deckName.trim() || deck.title;

  if (guestActive()) {
    const guestData = readGuestData();
    if (isDeckNameTaken(guestData.decks, importName)) {
      const message = 'You already have a deck with this name. Choose a different name.';
      return {
        imported: 0,
        skipped: 0,
        errors: [message],
        error: message
      };
    }

    let result: ImportResult = { imported: 0, skipped: 0, errors: [] };

    runGuestMutation((data) => {
      const created = guestCreateDeck(data, importName);
      if (!created.deck) {
        result = { imported: 0, skipped: deck.cards.length, errors: ['Could not create deck.'] };
        return created.data;
      }

      const outcome = guestImportRows(
        created.data,
        marketplaceCardsToImportRows(deck.cards),
        created.deck.id
      );
      result = outcome.result;
      return outcome.data;
    });

    return { ...result, deckName: importName };
  }

  const response = await fetch(
    `/api/marketplace/decks/${encodeURIComponent(marketplaceDeckId)}/import`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deckName: importName })
    }
  );

  const data = (await response.json()) as {
    result?: ImportResult;
    flashcards?: Parameters<typeof flashcards.set>[0];
    tags?: Parameters<typeof tags.set>[0];
    decks?: Parameters<typeof decks.set>[0];
    error?: string;
  };

  if (!response.ok) {
    const message = data.error ?? 'Could not import deck.';
    return { imported: 0, skipped: 0, errors: [message], error: message };
  }

  if (data.flashcards) flashcards.set(data.flashcards);
  if (data.tags) tags.set(data.tags);
  if (data.decks) decks.set(data.decks);

  return { ...(data.result ?? { imported: 0, skipped: 0, errors: ['Import failed.'] }), deckName: importName };
}
