import type { Flashcard } from '$lib/stores/flashcards';
import { startOfDay } from '$lib/utils/learnedProgress';

export type AchievementCategory = 'learned' | 'mastered' | 'streak';

export type AchievementDefinition = {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  threshold: number;
};

export type AchievementStatus = AchievementDefinition & {
  current: number;
  unlocked: boolean;
  progress: number;
};

const dayMs = 24 * 60 * 60 * 1000;

export const achievementDefinitions: AchievementDefinition[] = [
  {
    id: 'learned-10',
    category: 'learned',
    title: 'First steps',
    description: 'Learn 10 flashcards',
    threshold: 10
  },
  {
    id: 'learned-100',
    category: 'learned',
    title: 'Flashcard collector',
    description: 'Learn 100 flashcards',
    threshold: 100
  },
  {
    id: 'learned-1000',
    category: 'learned',
    title: 'Flashcard master',
    description: 'Learn 1,000 flashcards',
    threshold: 1000
  },
  {
    id: 'mastered-10',
    category: 'mastered',
    title: 'Sharp recall',
    description: 'Master 10 flashcards',
    threshold: 10
  },
  {
    id: 'mastered-50',
    category: 'mastered',
    title: 'Deep knowledge',
    description: 'Master 50 flashcards',
    threshold: 50
  },
  {
    id: 'mastered-100',
    category: 'mastered',
    title: 'True mastery',
    description: 'Master 100 flashcards',
    threshold: 100
  },
  {
    id: 'streak-3',
    category: 'streak',
    title: 'On a roll',
    description: 'Learn flashcards 3 days in a row',
    threshold: 3
  },
  {
    id: 'streak-7',
    category: 'streak',
    title: 'Weekly warrior',
    description: 'Learn flashcards 7 days in a row',
    threshold: 7
  },
  {
    id: 'streak-30',
    category: 'streak',
    title: 'Unstoppable',
    description: 'Learn flashcards 30 days in a row',
    threshold: 30
  }
];

function toDayKey(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

export function getLearningDayKeys(cards: Flashcard[]): string[] {
  const days = new Set<string>();

  for (const card of cards) {
    if (!card.star) continue;
    const learnedAt = card.learnedAt ?? card.addedAt;
    days.add(toDayKey(new Date(learnedAt)));
  }

  return [...days];
}

export function getCurrentLearningStreak(cards: Flashcard[]): number {
  const daySet = new Set(getLearningDayKeys(cards));
  if (daySet.size === 0) return 0;

  let streak = 0;
  let cursor = startOfDay(new Date());

  if (!daySet.has(toDayKey(cursor))) {
    cursor = new Date(cursor.getTime() - dayMs);
  }

  while (daySet.has(toDayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - dayMs);
  }

  return streak;
}

export function getAchievementCurrentValue(
  cards: Flashcard[],
  category: AchievementCategory
): number {
  switch (category) {
    case 'learned':
      return cards.filter((card) => card.star).length;
    case 'mastered':
      return cards.filter((card) => card.specialStar).length;
    case 'streak':
      return getCurrentLearningStreak(cards);
  }
}

export function evaluateAchievements(cards: Flashcard[]): AchievementStatus[] {
  return achievementDefinitions.map((achievement) => {
    const current = getAchievementCurrentValue(cards, achievement.category);
    const unlocked = current >= achievement.threshold;
    const progress = Math.min(current / achievement.threshold, 1);

    return {
      ...achievement,
      current,
      unlocked,
      progress
    };
  });
}
