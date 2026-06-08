import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { randomTagColor } from '$lib/utils/tagColors';

const STORAGE_KEY = 'memlyra-decks';

export type Deck = {
  id: string;
  label: string;
  color: string;
};

export const decks = writable<Deck[]>([]);

function save(items: Deck[]) {
  if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function createId(): string {
  return crypto.randomUUID();
}

function normalizeDeck(deck: Deck): Deck {
  return {
    ...deck,
    color: deck.color ?? randomTagColor()
  };
}

export function initDecks() {
  if (!browser) return;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    decks.set([]);
    return;
  }

  try {
    const parsed = JSON.parse(stored) as Deck[];
    const normalized = parsed.map(normalizeDeck);
    decks.set(normalized);
    if (normalized.some((deck, index) => !parsed[index]?.color)) {
      save(normalized);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    decks.set([]);
  }
}

export function createDeck(label: string): Deck | null {
  const trimmed = label.trim();
  if (!trimmed) return null;

  let created: Deck | null = null;

  decks.update((items) => {
    if (items.some((deck) => deck.label.toLowerCase() === trimmed.toLowerCase())) {
      return items;
    }

    created = { id: createId(), label: trimmed, color: randomTagColor() };
    const next = [...items, created];
    save(next);
    return next;
  });

  return created;
}

export function renameDeck(deckId: string, label: string): boolean {
  const trimmed = label.trim();
  if (!trimmed) return false;

  let ok = false;

  decks.update((items) => {
    const deck = items.find((item) => item.id === deckId);
    if (!deck) return items;

    if (items.some((item) => item.id !== deckId && item.label.toLowerCase() === trimmed.toLowerCase())) {
      return items;
    }

    ok = true;
    if (deck.label === trimmed) return items;

    const next = items.map((item) => (item.id === deckId ? { ...item, label: trimmed } : item));
    save(next);
    return next;
  });

  return ok;
}

export function deleteDeck(deckId: string) {
  decks.update((items) => {
    const next = items.filter((deck) => deck.id !== deckId);
    save(next);
    return next;
  });
}

export function getDeckById(deckId: string, items: Deck[]): Deck | undefined {
  return items.find((deck) => deck.id === deckId);
}

export function clearAllDecks() {
  decks.set([]);
  save([]);
}
