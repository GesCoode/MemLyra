import type { Flashcard } from '$lib/stores/flashcards';

export type ExerciseDirection = 'aToB' | 'bToA' | 'both';
export type QuizMode = 'type' | 'multipleChoice' | 'selfGrade' | 'anki';
export type CardDirection = 'aToB' | 'bToA';

export type ExerciseSettings = {
  deckId: string | 'all' | 'none';
  tagIds: string[];
  includeKnown: boolean;
  includeMastered: boolean;
  allowPeeking: boolean;
  cardCount: number | 'max';
  direction: ExerciseDirection;
  quizMode: QuizMode;
};

export type SessionCard = {
  id: string;
  cardId: string;
  prompt: string;
  answer: string;
  direction: CardDirection;
};

export function filterFlashcards(cards: Flashcard[], settings: ExerciseSettings): Flashcard[] {
  return cards.filter((card) => {
    if (settings.deckId === 'none') {
      if (card.deckId) return false;
    } else if (settings.deckId !== 'all' && card.deckId !== settings.deckId) {
      return false;
    }

    if (settings.tagIds.length > 0) {
      const hasTag = settings.tagIds.some((tagId) => card.tagIds.includes(tagId));
      if (!hasTag) return false;
    }

    if (!settings.includeKnown && !settings.includeMastered && card.star) return false;
    if (!settings.includeMastered && card.specialStar) return false;

    return true;
  });
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function pickDirection(settings: ExerciseSettings): CardDirection {
  if (settings.direction === 'aToB') return 'aToB';
  if (settings.direction === 'bToA') return 'bToA';
  return Math.random() < 0.5 ? 'aToB' : 'bToA';
}

function toSessionCard(card: Flashcard, direction: CardDirection): SessionCard {
  const prompt = direction === 'aToB' ? card.sideA : card.sideB;
  const answer = direction === 'aToB' ? card.sideB : card.sideA;

  return {
    id: crypto.randomUUID(),
    cardId: card.id,
    prompt,
    answer,
    direction
  };
}

export function buildExerciseSession(
  cards: Flashcard[],
  settings: ExerciseSettings
): SessionCard[] {
  const filtered = filterFlashcards(cards, settings);
  const shuffled = shuffle(filtered);
  const limit =
    settings.cardCount === 'max'
      ? shuffled.length
      : Math.min(settings.cardCount, shuffled.length);

  return shuffled.slice(0, limit).map((card) => toSessionCard(card, pickDirection(settings)));
}

/** Clone a session for replay — same cards, order, and directions; fresh row ids. */
export function cloneExerciseSession(session: SessionCard[]): SessionCard[] {
  return session.map((card) => ({
    ...card,
    id: crypto.randomUUID()
  }));
}

function normalizeAnswer(value: string): string {
  return value.trim();
}

function answerForDirection(card: Flashcard, direction: CardDirection): string {
  return normalizeAnswer(direction === 'aToB' ? card.sideB : card.sideA);
}

function collectWrongAnswers(cards: Flashcard[], sessionCard: SessionCard): string[] {
  const correct = normalizeAnswer(sessionCard.answer);

  return cards
    .filter((card) => card.id !== sessionCard.cardId)
    .map((card) => answerForDirection(card, sessionCard.direction))
    .filter((answer) => answer.length > 0 && answer !== correct);
}

function collectWrongAnswersFromSession(
  sessionCards: SessionCard[],
  sessionCard: SessionCard
): string[] {
  const correct = normalizeAnswer(sessionCard.answer);

  return sessionCards
    .filter(
      (card) => card.cardId !== sessionCard.cardId && card.direction === sessionCard.direction
    )
    .map((card) => normalizeAnswer(card.answer))
    .filter((answer) => answer.length > 0 && answer !== correct);
}

function mergeUniqueAnswers(...groups: string[][]): string[] {
  const merged: string[] = [];

  for (const group of groups) {
    for (const answer of group) {
      if (!merged.includes(answer)) {
        merged.push(answer);
      }
    }
  }

  return merged;
}

export function buildMultipleChoiceOptions(
  sessionCard: SessionCard,
  filteredPool: Flashcard[],
  allCards: Flashcard[] = filteredPool,
  sessionCards: SessionCard[] = []
): string[] {
  const correct = normalizeAnswer(sessionCard.answer);
  const uniqueWrong = mergeUniqueAnswers(
    collectWrongAnswers(filteredPool, sessionCard),
    collectWrongAnswers(allCards, sessionCard),
    collectWrongAnswersFromSession(sessionCards, sessionCard)
  );
  const wrong = shuffle(uniqueWrong).slice(0, 2);

  return shuffle([correct, ...wrong]);
}

const quizModeLabels: Record<QuizMode, string> = {
  type: 'Type answer',
  multipleChoice: 'Multiple choice',
  selfGrade: 'Self grade',
  anki: 'Anki style'
};

const directionLabels: Record<ExerciseDirection, string> = {
  aToB: 'A → B',
  bToA: 'B → A',
  both: 'Both ways'
};

export function quizModeLabel(mode: QuizMode): string {
  return quizModeLabels[mode];
}

export function directionLabel(direction: ExerciseDirection): string {
  return directionLabels[direction];
}

export function deckFilterLabel(
  deckId: ExerciseSettings['deckId'],
  decks: { id: string; label: string }[]
): string {
  if (deckId === 'all') return 'All decks';
  if (deckId === 'none') return 'Unassigned';
  return decks.find((deck) => deck.id === deckId)?.label ?? 'Selected deck';
}

function pluralUnit(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatExerciseDuration(ms: number): string {
  const totalSeconds = Math.max(1, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${pluralUnit(hours, 'hour')} ${pluralUnit(minutes, 'minute')}`;
  }

  if (minutes > 0 && seconds > 0) {
    return `${pluralUnit(minutes, 'minute')} ${pluralUnit(seconds, 'second')}`;
  }

  if (minutes > 0) {
    return pluralUnit(minutes, 'minute');
  }

  return pluralUnit(totalSeconds, 'second');
}

export function formatPerFlashcardDuration(ms: number, cardCount: number): string {
  const perMs = ms / Math.max(cardCount, 1);
  const perSeconds = Math.max(1, Math.round(perMs / 1000));

  if (perSeconds >= 60) {
    const minutes = Math.floor(perSeconds / 60);
    const seconds = perSeconds % 60;

    if (seconds === 0) {
      return pluralUnit(minutes, 'minute');
    }

    return `${pluralUnit(minutes, 'minute')} ${pluralUnit(seconds, 'second')}`;
  }

  return pluralUnit(perSeconds, 'second');
}

export function sessionCompleteCopy(
  accuracy: number | null,
  endedEarly: boolean,
  cardsGraded: number,
  cardsCompleted: number,
  sessionLength: number
): { headline: string; message: string } {
  if (endedEarly && cardsCompleted === 0) {
    return {
      headline: 'Session ended',
      message: 'You left before answering any flashcards. Come back whenever you are ready.'
    };
  }

  if (endedEarly) {
    const progress =
      cardsCompleted === sessionLength
        ? `You finished all ${sessionLength} flashcards before ending.`
        : `You completed ${cardsCompleted} of ${sessionLength} flashcards.`;

    if (accuracy === null) {
      return {
        headline: 'Session ended early',
        message: `${progress} Ungraded cards were not counted toward your score.`
      };
    }

    if (accuracy >= 75) {
      return {
        headline: 'Strong start',
        message: `${progress} Your accuracy on graded cards was ${accuracy}%.`
      };
    }

    return {
      headline: 'Session ended early',
      message: `${progress} Review the cards you missed and try another round when you are ready.`
    };
  }

  if (cardsGraded === 0) {
    return {
      headline: 'Session complete',
      message: `You went through ${sessionLength} flashcard${sessionLength === 1 ? '' : 's'} without grading.`
    };
  }

  if (accuracy === 100) {
    return {
      headline: 'Perfect score',
      message: `Every graded flashcard was correct. You nailed all ${cardsGraded} of them.`
    };
  }

  if (accuracy !== null && accuracy >= 85) {
    return {
      headline: 'Outstanding',
      message: `${correctSummary(cardsGraded, accuracy)} You are clearly getting comfortable with this set.`
    };
  }

  if (accuracy !== null && accuracy >= 65) {
    return {
      headline: 'Great work',
      message: `${correctSummary(cardsGraded, accuracy)} Solid progress — a few more reps will lock these in.`
    };
  }

  if (accuracy !== null && accuracy >= 40) {
    return {
      headline: 'Nice effort',
      message: `${correctSummary(cardsGraded, accuracy)} Focus on the ones you missed and run the set again soon.`
    };
  }

  return {
    headline: 'Keep practicing',
    message: `${correctSummary(cardsGraded, accuracy ?? 0)} Every session counts — consistency beats perfection.`
  };
}

function correctSummary(cardsGraded: number, accuracy: number): string {
  return `You answered ${cardsGraded} flashcard${cardsGraded === 1 ? '' : 's'} with ${accuracy}% accuracy.`;
}
