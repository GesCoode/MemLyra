import { writable } from 'svelte/store';

export type Deck = {
  id: string;
  label: string;
  color: string;
};

export const decks = writable<Deck[]>([]);

export async function loadDecks(): Promise<void> {
  const response = await fetch('/api/decks');
  if (!response.ok) {
    decks.set([]);
    return;
  }

  const data = (await response.json()) as { decks: Deck[] };
  decks.set(data.decks);
}

export function clearDecks() {
  decks.set([]);
}

export async function createDeck(label: string): Promise<Deck | null> {
  const trimmed = label.trim();
  if (!trimmed) return null;

  const response = await fetch('/api/decks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: trimmed })
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { deck: Deck };
  decks.update((items) => [...items, data.deck].sort((a, b) => a.label.localeCompare(b.label)));
  return data.deck;
}

export async function renameDeck(deckId: string, label: string): Promise<boolean> {
  const trimmed = label.trim();
  if (!trimmed) return false;

  const response = await fetch('/api/decks', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: deckId, label: trimmed })
  });

  if (!response.ok) return false;

  const data = (await response.json()) as { decks: Deck[] };
  decks.set(data.decks);
  return true;
}

export async function deleteDeck(deckId: string): Promise<boolean> {
  const response = await fetch(`/api/decks?id=${encodeURIComponent(deckId)}`, {
    method: 'DELETE'
  });

  if (!response.ok) return false;

  const data = (await response.json()) as {
    decks: Deck[];
    flashcards?: import('$lib/stores/flashcards').Flashcard[];
  };
  decks.set(data.decks);

  if (data.flashcards) {
    const { flashcards } = await import('$lib/stores/flashcards');
    flashcards.set(data.flashcards);
  }

  return true;
}

export function getDeckById(deckId: string, items: Deck[]): Deck | undefined {
  return items.find((deck) => deck.id === deckId);
}

export async function clearAllDecks(): Promise<void> {
  const current = await fetch('/api/decks').then((response) =>
    response.ok ? response.json() : { decks: [] }
  ) as { decks: Deck[] };

  for (const deck of current.decks) {
    await fetch(`/api/decks?id=${encodeURIComponent(deck.id)}`, { method: 'DELETE' });
  }

  decks.set([]);
}
