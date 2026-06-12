import { derived, writable } from 'svelte/store';
import { tags } from '$lib/stores/tags';
import type { CardDirection } from '$lib/utils/starProgress';

export type Flashcard = {
  id: string;
  sideA: string;
  sideB: string;
  deckId: string | null;
  tagIds: string[];
  timesSeen: number;
  timesCorrect: number;
  recentResultsAToB: boolean[];
  recentResultsBToA: boolean[];
  star: boolean;
  specialStar: boolean;
  bothWaysStar: boolean;
  addedAt: string;
  learnedAt: string | null;
  masteredAt: string | null;
  bothWaysAt: string | null;
};

export type ImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
};

export const flashcards = writable<Flashcard[]>([]);
export const learnedCount = derived(
  flashcards,
  ($flashcards) => $flashcards.filter((card) => card.star).length
);
export const masteredCount = derived(
  flashcards,
  ($flashcards) => $flashcards.filter((card) => card.specialStar).length
);
export const bothWaysCount = derived(
  flashcards,
  ($flashcards) => $flashcards.filter((card) => card.bothWaysStar).length
);

function replaceCard(items: Flashcard[], card: Flashcard): Flashcard[] {
  return items.map((entry) => (entry.id === card.id ? card : entry));
}

export async function loadFlashcards(): Promise<void> {
  const response = await fetch('/api/flashcards');
  if (!response.ok) {
    flashcards.set([]);
    return;
  }

  const data = (await response.json()) as { flashcards: Flashcard[] };
  flashcards.set(data.flashcards);
}

export function clearFlashcards() {
  flashcards.set([]);
}

export async function createFlashcard(
  sideA: string,
  sideB: string,
  tagIds: string[] = [],
  deckId: string | null = null
): Promise<Flashcard | null> {
  const response = await fetch('/api/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sideA, sideB, tagIds, deckId })
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { card: Flashcard };
  flashcards.update((items) => [data.card, ...items]);
  return data.card;
}

export async function updateFlashcardDeck(flashcardId: string, deckId: string | null): Promise<boolean> {
  const response = await fetch('/api/flashcards', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: flashcardId, deckId })
  });

  if (!response.ok) return false;

  const data = (await response.json()) as { flashcards: Flashcard[] };
  flashcards.set(data.flashcards);
  return true;
}

export async function updateFlashcardTags(flashcardId: string, tagIds: string[]): Promise<boolean> {
  const response = await fetch('/api/flashcards?action=tags', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: flashcardId, tagIds })
  });

  if (!response.ok) return false;

  const data = (await response.json()) as { flashcards: Flashcard[] };
  flashcards.set(data.flashcards);
  return true;
}

export async function deleteFlashcards(flashcardIds: string[]): Promise<boolean> {
  if (flashcardIds.length === 0) return true;

  const response = await fetch(`/api/flashcards?ids=${encodeURIComponent(flashcardIds.join(','))}`, {
    method: 'DELETE'
  });

  if (!response.ok) return false;

  const data = (await response.json()) as { flashcards: Flashcard[] };
  flashcards.set(data.flashcards);
  return true;
}

export async function deleteFlashcardsInDeck(deckId: string): Promise<boolean> {
  const response = await fetch(`/api/flashcards?deckId=${encodeURIComponent(deckId)}`, {
    method: 'DELETE'
  });

  if (!response.ok) return false;

  const data = (await response.json()) as { flashcards: Flashcard[] };
  flashcards.set(data.flashcards);
  return true;
}

export async function deleteFlashcard(flashcardId: string): Promise<boolean> {
  return deleteFlashcards([flashcardId]);
}

export async function importFlashcardRows(
  rows: { front: string; back: string; tagLabels?: string[] }[],
  deckId: string | null = null
): Promise<ImportResult> {
  const response = await fetch('/api/flashcards?action=import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows, deckId })
  });

  if (!response.ok) {
    return { imported: 0, skipped: rows.length, errors: ['Import failed.'] };
  }

  const data = (await response.json()) as {
    result: ImportResult;
    flashcards: Flashcard[];
    tags?: { id: string; label: string; color: string }[];
  };
  flashcards.set(data.flashcards);
  if (data.tags) tags.set(data.tags);
  return data.result;
}

export async function recordExerciseResult(
  cardId: string,
  correct: boolean,
  direction: CardDirection
): Promise<void> {
  const response = await fetch('/api/flashcards?action=progress', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: cardId, correct, direction })
  });

  if (!response.ok) return;

  const data = (await response.json()) as { card: Flashcard };
  flashcards.update((items) => replaceCard(items, data.card));
}

export async function recordExerciseSeen(cardId: string): Promise<void> {
  const response = await fetch('/api/flashcards?action=progress', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: cardId, seenOnly: true })
  });

  if (!response.ok) return;

  const data = (await response.json()) as { card: Flashcard };
  flashcards.update((items) => replaceCard(items, data.card));
}

export async function clearProgressMetrics(): Promise<void> {
  const response = await fetch('/api/flashcards?action=clear-progress', { method: 'POST' });
  if (!response.ok) return;

  const data = (await response.json()) as { flashcards: Flashcard[] };
  flashcards.set(data.flashcards);
}

export async function clearAllFlashcards(): Promise<void> {
  const response = await fetch('/api/flashcards?action=clear-all', { method: 'POST' });
  if (!response.ok) return;

  flashcards.set([]);
}
