import { browser } from '$app/environment';
import type { ExerciseDirection, QuizMode } from '$lib/utils/exercise';

const STORAGE_KEY = 'memlyra-exercise-setup';

export type PersistedExerciseSetup = {
  deckId: string | 'all' | 'none';
  tagIds: string[];
  includeKnown: boolean;
  includeMastered: boolean;
  allowPeeking: boolean;
  useMax: boolean;
  cardCount: number;
  direction: ExerciseDirection;
  quizMode: QuizMode;
};

const directions: ExerciseDirection[] = ['aToB', 'bToA', 'both'];
const quizModes: QuizMode[] = ['type', 'multipleChoice', 'selfGrade', 'anki'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parsePersistedExerciseSetup(value: unknown): PersistedExerciseSetup | null {
  if (!isRecord(value)) return null;

  const deckId = value.deckId;
  if (deckId !== 'all' && deckId !== 'none' && typeof deckId !== 'string') return null;

  if (!Array.isArray(value.tagIds) || !value.tagIds.every((id) => typeof id === 'string')) {
    return null;
  }

  if (
    typeof value.includeKnown !== 'boolean' ||
    typeof value.includeMastered !== 'boolean' ||
    typeof value.allowPeeking !== 'boolean' ||
    typeof value.useMax !== 'boolean' ||
    typeof value.cardCount !== 'number' ||
    !Number.isFinite(value.cardCount) ||
    value.cardCount < 1
  ) {
    return null;
  }

  if (!directions.includes(value.direction as ExerciseDirection)) return null;
  if (!quizModes.includes(value.quizMode as QuizMode)) return null;

  return {
    deckId,
    tagIds: value.tagIds,
    includeKnown: value.includeKnown,
    includeMastered: value.includeMastered,
    allowPeeking: value.allowPeeking,
    useMax: value.useMax,
    cardCount: Math.floor(value.cardCount),
    direction: value.direction as ExerciseDirection,
    quizMode: value.quizMode as QuizMode
  };
}

export function loadExerciseSetupPreferences(): PersistedExerciseSetup | null {
  if (!browser) return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parsePersistedExerciseSetup(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveExerciseSetupPreferences(preferences: PersistedExerciseSetup): void {
  if (!browser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
