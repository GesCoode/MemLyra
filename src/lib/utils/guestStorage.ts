import { browser } from '$app/environment';
import { GUEST_DATA_KEY } from '$lib/app';
import type { Deck } from '$lib/stores/decks';
import type { Flashcard } from '$lib/stores/flashcards';
import type { Tag } from '$lib/stores/tags';
import { randomTagColor } from '$lib/utils/tagColors';
import {
  isPreviousStarterPreset,
  LEGACY_STARTER_TAG_LABEL,
  STARTER_FLASHCARDS,
  STARTER_TAG_LABEL,
  stripGuestStarterPreset
} from '$lib/utils/guestStarterPreset';
import {
  appendRecentResult,
  computeStarProgress,
  type CardDirection
} from '$lib/utils/starProgress';

export type GuestData = {
  version: 1;
  decks: Deck[];
  tags: Tag[];
  flashcards: Flashcard[];
};

export { stripGuestStarterPreset };

const BASE_DECK_LABEL = 'base';
const BASE_DECK_COLOR = 'hsl(210 68% 62%)';

function emptyGuestData(): GuestData {
  return { version: 1, decks: [], tags: [], flashcards: [] };
}

function createId(): string {
  return crypto.randomUUID();
}

export function readGuestData(): GuestData {
  if (!browser) return emptyGuestData();

  const stored = localStorage.getItem(GUEST_DATA_KEY);
  if (!stored) return emptyGuestData();

  try {
    const parsed = JSON.parse(stored) as GuestData;
    if (parsed.version !== 1 || !Array.isArray(parsed.decks) || !Array.isArray(parsed.tags)) {
      return emptyGuestData();
    }
    return {
      version: 1,
      decks: parsed.decks ?? [],
      tags: parsed.tags ?? [],
      flashcards: parsed.flashcards ?? []
    };
  } catch {
    return emptyGuestData();
  }
}

export function writeGuestData(data: GuestData): void {
  if (!browser) return;
  localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));
}

export function hasGuestData(): boolean {
  const data = readGuestData();
  return data.decks.length > 0 || data.tags.length > 0 || data.flashcards.length > 0;
}

/** True when guest local data is worth uploading after registration. */
export function hasGuestDataToMigrate(): boolean {
  const data = stripGuestStarterPreset(readGuestData());
  if (data.flashcards.length > 0 || data.tags.length > 0) return true;
  return data.decks.some((deck) => deck.label.toLowerCase() !== 'base');
}

export function clearGuestData(): void {
  if (!browser) return;
  localStorage.removeItem(GUEST_DATA_KEY);
}

function findStarterTag(tags: Tag[]): Tag | undefined {
  return tags.find((tag) => {
    const label = tag.label.toLowerCase();
    return label === STARTER_TAG_LABEL.toLowerCase() || label === LEGACY_STARTER_TAG_LABEL;
  });
}

function refreshStarterPresetCards(data: GuestData, baseDeckId: string): GuestData {
  const starterTag = findStarterTag(data.tags);
  if (!starterTag) return data;

  const starterCards = data.flashcards.filter((card) => card.tagIds.includes(starterTag.id));
  if (!isPreviousStarterPreset(starterCards)) return data;

  const otherCards = data.flashcards.filter((card) => !card.tagIds.includes(starterTag.id));
  const newStarterCards = STARTER_FLASHCARDS.map(({ front, back }) =>
    newFlashcard(front, back, [starterTag.id], baseDeckId)
  );

  return {
    ...data,
    flashcards: [...newStarterCards, ...otherCards]
  };
}

function migrateStarterPreset(data: GuestData, baseDeckId: string): GuestData {
  const starterTag = findStarterTag(data.tags);
  if (!starterTag) return data;

  let next = data;

  if (starterTag.label.toLowerCase() === LEGACY_STARTER_TAG_LABEL) {
    next = {
      ...next,
      tags: next.tags
        .map((tag) =>
          tag.id === starterTag.id ? { ...tag, label: STARTER_TAG_LABEL } : tag
        )
        .sort((a, b) => a.label.localeCompare(b.label))
    };
  }

  return refreshStarterPresetCards(next, baseDeckId);
}

/** Seed preset cards when the guest library is still empty. */
function shouldSeedStarterCards(data: GuestData): boolean {
  return data.flashcards.length === 0;
}

function seedStarterCards(data: GuestData, baseDeckId: string): GuestData {
  const existingStarterTag = findStarterTag(data.tags);
  const starterTag: Tag =
    existingStarterTag ??
    ({
      id: createId(),
      label: STARTER_TAG_LABEL,
      color: randomTagColor()
    } satisfies Tag);

  const starterCards = STARTER_FLASHCARDS.map(({ front, back }) =>
    newFlashcard(front, back, [starterTag.id], baseDeckId)
  );

  return {
    ...data,
    tags: existingStarterTag
      ? data.tags
      : [...data.tags, starterTag].sort((a, b) => a.label.localeCompare(b.label)),
    flashcards: [...starterCards, ...data.flashcards]
  };
}

export function ensureGuestSeed(): GuestData {
  if (!browser) return emptyGuestData();

  let data = readGuestData();
  let dirty = false;

  let baseDeck = data.decks.find((deck) => deck.label.toLowerCase() === BASE_DECK_LABEL);
  if (!baseDeck) {
    baseDeck = {
      id: createId(),
      label: BASE_DECK_LABEL,
      color: BASE_DECK_COLOR
    };
    data = {
      ...data,
      decks: [...data.decks, baseDeck].sort((a, b) => a.label.localeCompare(b.label))
    };
    dirty = true;
  }

  if (shouldSeedStarterCards(data)) {
    data = seedStarterCards(data, baseDeck.id);
    dirty = true;
  }

  const migrated = migrateStarterPreset(data, baseDeck.id);
  if (migrated !== data) {
    data = migrated;
    dirty = true;
  }

  if (dirty) {
    writeGuestData(data);
  }

  return data;
}

function newFlashcard(
  sideA: string,
  sideB: string,
  tagIds: string[] = [],
  deckId: string | null = null
): Flashcard {
  const now = new Date().toISOString();
  return {
    id: createId(),
    sideA: sideA.trim(),
    sideB: sideB.trim(),
    deckId,
    tagIds,
    timesSeen: 0,
    timesCorrect: 0,
    recentResultsAToB: [],
    recentResultsBToA: [],
    star: false,
    specialStar: false,
    bothWaysStar: false,
    addedAt: now,
    learnedAt: null,
    masteredAt: null,
    bothWaysAt: null
  };
}

function applyExerciseResult(card: Flashcard, correct: boolean, direction: CardDirection): Flashcard {
  const recentResultsAToB =
    direction === 'aToB' ? appendRecentResult(card.recentResultsAToB, correct) : card.recentResultsAToB;
  const recentResultsBToA =
    direction === 'bToA' ? appendRecentResult(card.recentResultsBToA, correct) : card.recentResultsBToA;
  const progress = computeStarProgress({ aToB: recentResultsAToB, bToA: recentResultsBToA });
  const now = new Date().toISOString();

  return {
    ...card,
    recentResultsAToB,
    recentResultsBToA,
    timesSeen: card.timesSeen + 1,
    timesCorrect: card.timesCorrect + (correct ? 1 : 0),
    star: progress.star,
    specialStar: progress.specialStar,
    bothWaysStar: progress.bothWaysStar,
    learnedAt: progress.star ? (card.learnedAt ?? now) : card.learnedAt,
    masteredAt: progress.specialStar ? (card.masteredAt ?? now) : card.masteredAt,
    bothWaysAt: progress.bothWaysStar ? (card.bothWaysAt ?? now) : card.bothWaysAt
  };
}

export function guestCreateDeck(data: GuestData, label: string): { data: GuestData; deck: Deck | null } {
  const trimmed = label.trim();
  if (!trimmed) return { data, deck: null };

  const deck: Deck = { id: createId(), label: trimmed, color: randomTagColor() };
  return {
    data: {
      ...data,
      decks: [...data.decks, deck].sort((a, b) => a.label.localeCompare(b.label))
    },
    deck
  };
}

export function guestRenameDeck(data: GuestData, deckId: string, label: string): GuestData {
  const trimmed = label.trim();
  if (!trimmed) return data;

  return {
    ...data,
    decks: data.decks
      .map((deck) => (deck.id === deckId ? { ...deck, label: trimmed } : deck))
      .sort((a, b) => a.label.localeCompare(b.label))
  };
}

export function guestDeleteDeck(data: GuestData, deckId: string): GuestData {
  return {
    ...data,
    decks: data.decks.filter((deck) => deck.id !== deckId),
    flashcards: data.flashcards.map((card) =>
      card.deckId === deckId ? { ...card, deckId: null } : card
    )
  };
}

export function guestCreateTag(data: GuestData, label: string): { data: GuestData; tag: Tag | null } {
  const trimmed = label.trim();
  if (!trimmed) return { data, tag: null };

  const existing = data.tags.find((tag) => tag.label.toLowerCase() === trimmed.toLowerCase());
  if (existing) return { data, tag: existing };

  const tag: Tag = { id: createId(), label: trimmed, color: randomTagColor() };
  return {
    data: { ...data, tags: [...data.tags, tag].sort((a, b) => a.label.localeCompare(b.label)) },
    tag
  };
}

export function guestFindOrCreateTag(data: GuestData, label: string): { data: GuestData; tag: Tag | null } {
  return guestCreateTag(data, label);
}

export function guestRenameTag(data: GuestData, tagId: string, label: string): GuestData {
  const trimmed = label.trim();
  if (!trimmed) return data;

  return {
    ...data,
    tags: data.tags
      .map((tag) => (tag.id === tagId ? { ...tag, label: trimmed } : tag))
      .sort((a, b) => a.label.localeCompare(b.label))
  };
}

export function guestDeleteTag(data: GuestData, tagId: string): GuestData {
  return {
    ...data,
    tags: data.tags.filter((tag) => tag.id !== tagId),
    flashcards: data.flashcards.map((card) => ({
      ...card,
      tagIds: card.tagIds.filter((id) => id !== tagId)
    }))
  };
}

export function guestCreateFlashcard(
  data: GuestData,
  sideA: string,
  sideB: string,
  tagIds: string[] = [],
  deckId: string | null = null
): { data: GuestData; card: Flashcard | null } {
  const front = sideA.trim();
  const back = sideB.trim();
  if (!front || !back) return { data, card: null };

  const card = newFlashcard(front, back, tagIds, deckId);
  return { data: { ...data, flashcards: [card, ...data.flashcards] }, card };
}

export function guestUpdateFlashcardDeck(
  data: GuestData,
  flashcardId: string,
  deckId: string | null
): GuestData {
  return {
    ...data,
    flashcards: data.flashcards.map((card) =>
      card.id === flashcardId ? { ...card, deckId } : card
    )
  };
}

export function guestUpdateFlashcardTags(
  data: GuestData,
  flashcardId: string,
  tagIds: string[]
): GuestData {
  return {
    ...data,
    flashcards: data.flashcards.map((card) =>
      card.id === flashcardId ? { ...card, tagIds } : card
    )
  };
}

export function guestDeleteFlashcards(data: GuestData, flashcardIds: string[]): GuestData {
  const ids = new Set(flashcardIds);
  return {
    ...data,
    flashcards: data.flashcards.filter((card) => !ids.has(card.id))
  };
}

export function guestImportRows(
  data: GuestData,
  rows: { front: string; back: string; tagLabels?: string[] }[],
  deckId: string | null = null
): { data: GuestData; result: { imported: number; skipped: number; errors: string[] } } {
  let next = data;
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const [index, row] of rows.entries()) {
    const front = row.front.trim();
    const back = row.back.trim();
    if (!front || !back) {
      skipped += 1;
      errors.push(`Line ${index + 1}: missing side A or side B.`);
      continue;
    }

    const tagIds: string[] = [];
    for (const label of row.tagLabels ?? []) {
      const result = guestFindOrCreateTag(next, label);
      next = result.data;
      if (result.tag) tagIds.push(result.tag.id);
    }

    const created = guestCreateFlashcard(next, front, back, tagIds, deckId);
    next = created.data;
    if (!created.card) {
      skipped += 1;
      errors.push(`Line ${index + 1}: could not create flashcard.`);
      continue;
    }

    imported += 1;
  }

  return { data: next, result: { imported, skipped, errors } };
}

export function guestDeleteFlashcardsInDeck(data: GuestData, deckId: string): GuestData {
  return {
    ...data,
    flashcards: data.flashcards.filter((card) => card.deckId !== deckId)
  };
}

export function guestRecordExerciseResult(
  data: GuestData,
  cardId: string,
  correct: boolean,
  direction: CardDirection
): { data: GuestData; card: Flashcard | null } {
  let updated: Flashcard | null = null;
  const flashcards = data.flashcards.map((card) => {
    if (card.id !== cardId) return card;
    updated = applyExerciseResult(card, correct, direction);
    return updated;
  });

  if (!updated) return { data, card: null };
  return { data: { ...data, flashcards }, card: updated };
}

export function guestRecordExerciseSeen(data: GuestData, cardId: string): { data: GuestData; card: Flashcard | null } {
  let updated: Flashcard | null = null;
  const flashcards = data.flashcards.map((card) => {
    if (card.id !== cardId) return card;
    updated = { ...card, timesSeen: card.timesSeen + 1 };
    return updated;
  });

  if (!updated) return { data, card: null };
  return { data: { ...data, flashcards }, card: updated };
}
