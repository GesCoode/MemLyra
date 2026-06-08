export type ScoreResult = {
  correctLetters: number;
  wrongLetters: number;
  percent: number;
  isCorrect: boolean;
};

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

export function scoreGuess(guess: string, target: string): ScoreResult {
  const normalizedGuess = normalize(guess);
  const normalizedTarget = normalize(target);

  if (!normalizedTarget) {
    return {
      correctLetters: 0,
      wrongLetters: normalizedGuess.length,
      percent: 0,
      isCorrect: false
    };
  }

  if (!normalizedGuess) {
    return {
      correctLetters: 0,
      wrongLetters: normalizedTarget.length,
      percent: 0,
      isCorrect: false
    };
  }

  const targetCounts = new Map<string, number>();
  for (const char of normalizedTarget) {
    targetCounts.set(char, (targetCounts.get(char) ?? 0) + 1);
  }

  let correctLetters = 0;
  for (const char of normalizedGuess) {
    const remaining = targetCounts.get(char) ?? 0;
    if (remaining > 0) {
      correctLetters += 1;
      targetCounts.set(char, remaining - 1);
    }
  }

  const wrongLetters = Math.max(normalizedGuess.length - correctLetters, 0);
  const percent = Math.round((correctLetters / normalizedTarget.length) * 100);

  return {
    correctLetters,
    wrongLetters,
    percent,
    isCorrect: percent > 75
  };
}
