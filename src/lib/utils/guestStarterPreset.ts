import type { Flashcard } from '$lib/stores/flashcards';
import type { Tag } from '$lib/stores/tags';

export const STARTER_TAG_LABEL = 'Spanish starters';
export const LEGACY_STARTER_TAG_LABEL = 'starter';

export const STARTER_FLASHCARDS = [
  { front: 'Gracias', back: 'Thank you' },
  { front: 'Azul', back: 'Blue' },
  { front: 'Mesa', back: 'Table' },
  { front: 'Gato', back: 'cat' }
] as const;

/** Earlier guest starter sets (either side order). */
export const PREVIOUS_STARTER_PAIRS = [
  ['gracias', 'thank you'],
  ['hola', 'hello'],
  ['buenos días', 'good morning'],
  ['adiós', 'bye'],
  ['adiós', 'goodbye'],
  ['hello', 'hola'],
  ['thank you', 'gracias'],
  ['good morning', 'buenos días'],
  ['goodbye', 'adiós']
] as const;

const STARTER_TAG_LABELS = new Set(
  [STARTER_TAG_LABEL, LEGACY_STARTER_TAG_LABEL].map((label) => label.toLowerCase())
);

const STARTER_PAIR_KEYS = new Set(
  [
    ...STARTER_FLASHCARDS.map(({ front, back }) => pairKey(front, back)),
    ...PREVIOUS_STARTER_PAIRS.map(([a, b]) => pairKey(a, b))
  ]
);

function pairKey(sideA: string, sideB: string): string {
  return `${sideA.trim().toLowerCase()}|${sideB.trim().toLowerCase()}`;
}

export function isGuestStarterTag(tag: Pick<Tag, 'label'>): boolean {
  return STARTER_TAG_LABELS.has(tag.label.toLowerCase());
}

export function isGuestStarterPresetCard(card: Pick<Flashcard, 'sideA' | 'sideB' | 'tagIds'>, starterTagIds: Set<string>): boolean {
  if (card.tagIds.some((tagId) => starterTagIds.has(tagId))) return true;
  return STARTER_PAIR_KEYS.has(pairKey(card.sideA, card.sideB));
}

/** Remove practice-mode preset cards/tags before persisting to a registered account. */
export function stripGuestStarterPreset<
  T extends { tags: Tag[]; flashcards: Flashcard[]; decks?: unknown[] }
>(data: T): T {
  const starterTagIds = new Set(data.tags.filter(isGuestStarterTag).map((tag) => tag.id));

  const flashcards = data.flashcards.filter(
    (card) => !isGuestStarterPresetCard(card, starterTagIds)
  );
  const tags = data.tags.filter((tag) => !isGuestStarterTag(tag));

  return { ...data, tags, flashcards };
}

export function isPreviousStarterPreset(cards: Flashcard[]): boolean {
  if (cards.length !== STARTER_FLASHCARDS.length) return false;
  return cards.every((card) => STARTER_PAIR_KEYS.has(pairKey(card.sideA, card.sideB)));
}
