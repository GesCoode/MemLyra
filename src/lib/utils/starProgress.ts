export const RECENT_RESULTS_LIMIT = 3;

export type CardDirection = 'aToB' | 'bToA';

export type DirectionHistory = {
  aToB: boolean[];
  bToA: boolean[];
};

export type StarProgress = {
  star: boolean;
  specialStar: boolean;
  bothWaysStar: boolean;
};

export function appendRecentResult(history: boolean[], correct: boolean): boolean[] {
  const next = [...history, correct];
  if (next.length > RECENT_RESULTS_LIMIT) {
    return next.slice(-RECENT_RESULTS_LIMIT);
  }
  return next;
}

/** Learned for a direction: more than 50% correct in recent attempts. */
export function isDirectionLearned(history: boolean[]): boolean {
  if (history.length === 0) return false;
  const correctCount = history.filter(Boolean).length;
  return correctCount / history.length > 0.5;
}

/** Mastered for a direction: seen at least 3 times and 100% correct in recent attempts. */
export function isDirectionMastered(history: boolean[]): boolean {
  if (history.length < RECENT_RESULTS_LIMIT) return false;
  return history.every(Boolean);
}

export function computeStarProgress(history: DirectionHistory): StarProgress {
  const aToBLearned = isDirectionLearned(history.aToB);
  const bToALearned = isDirectionLearned(history.bToA);

  return {
    star: aToBLearned || bToALearned,
    specialStar: isDirectionMastered(history.aToB) || isDirectionMastered(history.bToA),
    bothWaysStar: aToBLearned && bToALearned
  };
}

export function cardDirectionHistory(card: {
  recentResultsAToB: boolean[];
  recentResultsBToA: boolean[];
}): DirectionHistory {
  return {
    aToB: card.recentResultsAToB,
    bToA: card.recentResultsBToA
  };
}
