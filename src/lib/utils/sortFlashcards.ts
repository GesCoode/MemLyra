import type { Flashcard } from '$lib/stores/flashcards';
import type { Deck } from '$lib/stores/decks';
import type { Tag } from '$lib/stores/tags';

export type SortField =
  | 'deck'
  | 'tag'
  | 'alphabetical'
  | 'star'
  | 'specialStar'
  | 'bothWaysStar'
  | 'addedDate'
  | 'learnedDate';

export type SortDirection = 'asc' | 'desc';

function tagLabel(card: Flashcard, tags: Tag[]): string {
  return card.tagIds
    .map((id) => tags.find((tag) => tag.id === id)?.label)
    .filter(Boolean)
    .join(', ')
    .toLowerCase();
}

function deckLabel(card: Flashcard, decks: Deck[]): string {
  return decks.find((deck) => deck.id === card.deckId)?.label.toLowerCase() ?? '';
}

function compareText(a: string, b: string, direction: SortDirection): number {
  const result = a.localeCompare(b, undefined, { sensitivity: 'base' });
  return direction === 'asc' ? result : -result;
}

function compareNumber(a: number, b: number, direction: SortDirection): number {
  return direction === 'asc' ? a - b : b - a;
}

function compareDate(a: string | null, b: string | null, direction: SortDirection): number {
  const aTime = a ? Date.parse(a) : 0;
  const bTime = b ? Date.parse(b) : 0;
  return compareNumber(aTime, bTime, direction);
}

function compareBoolean(a: boolean, b: boolean, direction: SortDirection): number {
  const aNum = a ? 1 : 0;
  const bNum = b ? 1 : 0;
  return compareNumber(aNum, bNum, direction);
}

export function sortFlashcards(
  cards: Flashcard[],
  tags: Tag[],
  field: SortField,
  direction: SortDirection,
  decks: Deck[] = []
): Flashcard[] {
  const sorted = [...cards];

  sorted.sort((left, right) => {
    switch (field) {
      case 'deck':
        return compareText(deckLabel(left, decks), deckLabel(right, decks), direction);
      case 'tag':
        return compareText(tagLabel(left, tags), tagLabel(right, tags), direction);
      case 'alphabetical':
        return compareText(left.sideA, right.sideA, direction);
      case 'star':
        return (
          compareBoolean(left.star, right.star, direction) ||
          compareText(left.sideA, right.sideA, 'asc')
        );
      case 'specialStar':
        return (
          compareBoolean(left.specialStar, right.specialStar, direction) ||
          compareText(left.sideA, right.sideA, 'asc')
        );
      case 'bothWaysStar':
        return (
          compareBoolean(left.bothWaysStar, right.bothWaysStar, direction) ||
          compareText(left.sideA, right.sideA, 'asc')
        );
      case 'addedDate':
        return compareDate(left.addedAt, right.addedAt, direction);
      case 'learnedDate':
        return compareDate(left.learnedAt, right.learnedAt, direction);
      default:
        return 0;
    }
  });

  return sorted;
}

export function formatTagLabels(card: Flashcard, tags: Tag[]): string {
  const labels = card.tagIds
    .map((id) => tags.find((tag) => tag.id === id)?.label)
    .filter(Boolean);

  return labels.length > 0 ? labels.join(', ') : '—';
}

export function formatDeckLabel(card: Flashcard, decks: Deck[]): string {
  return decks.find((deck) => deck.id === card.deckId)?.label ?? '—';
}
