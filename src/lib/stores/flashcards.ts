import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';
import { findOrCreateTag } from '$lib/stores/tags';
import {
  appendRecentResult,
  cardDirectionHistory,
  computeStarProgress,
  type CardDirection
} from '$lib/utils/starProgress';

const STORAGE_KEY = 'memlyra-flashcards';

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

function save(items: Flashcard[]) {
  if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function createId(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

type LegacyFlashcard = Partial<Flashcard> & {
  id: string;
  sideA: string;
  sideB: string;
  learned?: boolean;
  mastered?: boolean;
};

function normalizeCard(raw: LegacyFlashcard): Flashcard {
  const recentResultsAToB = raw.recentResultsAToB ?? [];
  const recentResultsBToA = raw.recentResultsBToA ?? [];
  const addedAt = raw.addedAt ?? nowIso();
  const progress = computeStarProgress(cardDirectionHistory({ recentResultsAToB, recentResultsBToA }));

  return {
    id: raw.id,
    sideA: raw.sideA,
    sideB: raw.sideB,
    deckId: raw.deckId ?? null,
    tagIds: raw.tagIds ?? [],
    timesSeen: raw.timesSeen ?? 0,
    timesCorrect: raw.timesCorrect ?? 0,
    recentResultsAToB,
    recentResultsBToA,
    star: progress.star,
    specialStar: progress.specialStar,
    bothWaysStar: progress.bothWaysStar,
    addedAt,
    learnedAt: progress.star ? (raw.learnedAt ?? null) : null,
    masteredAt: progress.specialStar ? (raw.masteredAt ?? null) : null,
    bothWaysAt: progress.bothWaysStar ? (raw.bothWaysAt ?? null) : null
  };
}

export function initFlashcards() {
  if (!browser) return;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    flashcards.set([]);
    return;
  }

  try {
    const parsed = JSON.parse(stored) as LegacyFlashcard[];
    const normalized = parsed.map(normalizeCard);
    flashcards.set(normalized);
    save(normalized);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    flashcards.set([]);
  }
}

export function createFlashcard(
  sideA: string,
  sideB: string,
  tagIds: string[] = [],
  deckId: string | null = null
): Flashcard | null {
  const front = sideA.trim();
  const back = sideB.trim();
  if (!front || !back) return null;

  const card: Flashcard = {
    id: createId(),
    sideA: front,
    sideB: back,
    deckId,
    tagIds,
    timesSeen: 0,
    timesCorrect: 0,
    recentResultsAToB: [],
    recentResultsBToA: [],
    star: false,
    specialStar: false,
    bothWaysStar: false,
    addedAt: nowIso(),
    learnedAt: null,
    masteredAt: null,
    bothWaysAt: null
  };

  flashcards.update((items) => {
    const next = [card, ...items];
    save(next);
    return next;
  });

  return card;
}

export function updateFlashcardDeck(flashcardId: string, deckId: string | null) {
  flashcards.update((items) => {
    const next = items.map((card) =>
      card.id === flashcardId ? { ...card, deckId } : card
    );
    save(next);
    return next;
  });
}

export function clearDeckFromAllFlashcards(deckId: string) {
  flashcards.update((items) => {
    const next = items.map((card) =>
      card.deckId === deckId ? { ...card, deckId: null } : card
    );
    save(next);
    return next;
  });
}

export function deleteFlashcards(flashcardIds: string[]) {
  const ids = new Set(flashcardIds);
  flashcards.update((items) => {
    const next = items.filter((card) => !ids.has(card.id));
    save(next);
    return next;
  });
}

export function deleteFlashcardsInDeck(deckId: string) {
  flashcards.update((items) => {
    const next = items.filter((card) => card.deckId !== deckId);
    save(next);
    return next;
  });
}

export function deleteFlashcard(flashcardId: string) {
  deleteFlashcards([flashcardId]);
}

export function updateFlashcardTags(flashcardId: string, tagIds: string[]) {
  flashcards.update((items) => {
    const next = items.map((card) =>
      card.id === flashcardId ? { ...card, tagIds } : card
    );
    save(next);
    return next;
  });
}

export function removeTagFromAllFlashcards(tagId: string) {
  flashcards.update((items) => {
    const next = items.map((card) => ({
      ...card,
      tagIds: card.tagIds.filter((id) => id !== tagId)
    }));
    save(next);
    return next;
  });
}

export function importFlashcardRows(
  rows: { front: string; back: string; tagLabels?: string[] }[],
  deckId: string | null = null
): ImportResult {
  const result: ImportResult = { imported: 0, skipped: 0, errors: [] };
  const newCards: Flashcard[] = [];
  const createdAt = nowIso();

  for (const [index, row] of rows.entries()) {
    const front = row.front.trim();
    const back = row.back.trim();

    if (!front || !back) {
      result.skipped += 1;
      result.errors.push(`Line ${index + 1}: missing side A or side B.`);
      continue;
    }

    const tagIds: string[] = [];
    for (const label of row.tagLabels ?? []) {
      const tag = findOrCreateTag(label);
      if (tag) tagIds.push(tag.id);
    }

    newCards.push({
      id: createId(),
      sideA: front,
      sideB: back,
      deckId,
      tagIds,
      timesSeen: 0,
      timesCorrect: 0,
      recentResultsAToB: [],
      recentResultsBToA: [],
      star: false,
      specialStar: false,
      bothWaysStar: false,
      addedAt: createdAt,
      learnedAt: null,
      masteredAt: null,
      bothWaysAt: null
    });
    result.imported += 1;
  }

  if (newCards.length > 0) {
    flashcards.update((items) => {
      const next = [...newCards, ...items];
      save(next);
      return next;
    });
  }

  return result;
}

function applyExerciseResult(
  card: Flashcard,
  correct: boolean,
  direction: CardDirection
): Flashcard {
  const recentResultsAToB =
    direction === 'aToB' ? appendRecentResult(card.recentResultsAToB, correct) : card.recentResultsAToB;
  const recentResultsBToA =
    direction === 'bToA' ? appendRecentResult(card.recentResultsBToA, correct) : card.recentResultsBToA;
  const progress = computeStarProgress({ aToB: recentResultsAToB, bToA: recentResultsBToA });
  const learnedAt = progress.star ? (card.learnedAt ?? nowIso()) : null;
  const masteredAt = progress.specialStar ? (card.masteredAt ?? nowIso()) : null;
  const bothWaysAt = progress.bothWaysStar ? (card.bothWaysAt ?? nowIso()) : null;

  return {
    ...card,
    recentResultsAToB,
    recentResultsBToA,
    timesSeen: card.timesSeen + 1,
    timesCorrect: card.timesCorrect + (correct ? 1 : 0),
    star: progress.star,
    specialStar: progress.specialStar,
    bothWaysStar: progress.bothWaysStar,
    learnedAt,
    masteredAt,
    bothWaysAt
  };
}

export function recordExerciseResult(cardId: string, correct: boolean, direction: CardDirection) {
  flashcards.update((items) => {
    const next = items.map((card) => {
      if (card.id !== cardId) return card;
      return applyExerciseResult(card, correct, direction);
    });

    save(next);
    return next;
  });
}

export function recordExerciseSeen(cardId: string) {
  flashcards.update((items) => {
    const next = items.map((card) =>
      card.id === cardId ? { ...card, timesSeen: card.timesSeen + 1 } : card
    );
    save(next);
    return next;
  });
}

export function clearProgressMetrics() {
  flashcards.update((items) => {
    const next = items.map((card) => ({
      ...card,
      timesSeen: 0,
      timesCorrect: 0,
      recentResultsAToB: [],
      recentResultsBToA: [],
      star: false,
      specialStar: false,
      bothWaysStar: false,
      learnedAt: null,
      masteredAt: null,
      bothWaysAt: null
    }));
    save(next);
    return next;
  });
}

export function clearAllFlashcards() {
  flashcards.set([]);
  save([]);
}
