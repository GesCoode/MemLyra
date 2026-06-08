import type { Flashcard } from '$lib/stores/flashcards';

export type ProgressSeriesPoint = {
  date: string;
  label: string;
  learned: number;
  mastered: number;
  bothWays: number;
};

const dayMs = 24 * 60 * 60 * 1000;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatChartDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function isLearnedCard(card: Flashcard): boolean {
  return card.star || card.specialStar || card.bothWaysStar;
}

function learnedEarnedAt(card: Flashcard): string | null {
  if (!card.star) return null;
  return card.learnedAt ?? card.addedAt;
}

function masteredEarnedAt(card: Flashcard): string | null {
  if (!card.specialStar) return null;
  return card.masteredAt ?? card.learnedAt ?? card.addedAt;
}

function bothWaysEarnedAt(card: Flashcard): string | null {
  if (!card.bothWaysStar) return null;
  return card.bothWaysAt ?? card.learnedAt ?? card.addedAt;
}

export function learnedOnDate(card: Flashcard): string | null {
  if (!isLearnedCard(card)) return null;
  return learnedEarnedAt(card);
}

function collectEarnedTimestamps(
  cards: Flashcard[],
  selector: (card: Flashcard) => string | null,
  rangeStart: number,
  rangeEnd: number
): number[] {
  return cards
    .map(selector)
    .filter((value): value is string => Boolean(value))
    .map((value) => startOfDay(new Date(value)).getTime())
    .filter((value) => value >= rangeStart && value <= rangeEnd)
    .sort((left, right) => left - right);
}

function buildDailySeries(
  rangeStart: number,
  rangeEnd: number,
  learnedTimestamps: number[],
  masteredTimestamps: number[],
  bothWaysTimestamps: number[]
): ProgressSeriesPoint[] {
  const points: ProgressSeriesPoint[] = [];
  let learnedIndex = 0;
  let masteredIndex = 0;
  let bothWaysIndex = 0;
  let learnedCount = 0;
  let masteredCount = 0;
  let bothWaysCount = 0;

  for (let day = rangeStart; day <= rangeEnd; day += dayMs) {
    while (learnedIndex < learnedTimestamps.length && learnedTimestamps[learnedIndex] <= day) {
      learnedCount += 1;
      learnedIndex += 1;
    }
    while (masteredIndex < masteredTimestamps.length && masteredTimestamps[masteredIndex] <= day) {
      masteredCount += 1;
      masteredIndex += 1;
    }
    while (
      bothWaysIndex < bothWaysTimestamps.length &&
      bothWaysTimestamps[bothWaysIndex] <= day
    ) {
      bothWaysCount += 1;
      bothWaysIndex += 1;
    }

    const current = new Date(day);
    points.push({
      date: current.toISOString().slice(0, 10),
      label: formatChartDate(current),
      learned: learnedCount,
      mastered: masteredCount,
      bothWays: bothWaysCount
    });
  }

  return points;
}

function currentTotals(cards: Flashcard[]) {
  return {
    learned: cards.filter((card) => card.star).length,
    mastered: cards.filter((card) => card.specialStar).length,
    bothWays: cards.filter((card) => card.bothWaysStar).length
  };
}

export function buildLearnedProgressSeries(
  cards: Flashcard[],
  startDate: Date,
  endDate: Date = new Date()
): ProgressSeriesPoint[] {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  const rangeStart = start.getTime() <= end.getTime() ? start.getTime() : end.getTime();
  const rangeEnd = end.getTime();
  const isFirstDay = rangeStart === rangeEnd;

  if (isFirstDay) {
    const label = formatChartDate(start);
    const date = start.toISOString().slice(0, 10);
    const totals = currentTotals(cards);

    return [
      { date, label, learned: 0, mastered: 0, bothWays: 0 },
      { date, label, ...totals }
    ];
  }

  const learnedTimestamps = collectEarnedTimestamps(cards, learnedEarnedAt, rangeStart, rangeEnd);
  const masteredTimestamps = collectEarnedTimestamps(cards, masteredEarnedAt, rangeStart, rangeEnd);
  const bothWaysTimestamps = collectEarnedTimestamps(cards, bothWaysEarnedAt, rangeStart, rangeEnd);

  const points = buildDailySeries(
    rangeStart,
    rangeEnd,
    learnedTimestamps,
    masteredTimestamps,
    bothWaysTimestamps
  );

  if (points.length === 0) {
    const label = formatChartDate(new Date(rangeStart));
    return [
      {
        date: new Date(rangeStart).toISOString().slice(0, 10),
        label,
        learned: 0,
        mastered: 0,
        bothWays: 0
      }
    ];
  }

  return points;
}

export const progressSeriesColors = {
  learned: {
    line: '#8fb4e8',
    fillTop: 'rgba(143, 180, 232, 0.32)',
    fillBottom: 'rgba(143, 180, 232, 0.02)',
    point: '#b8d4f5'
  },
  mastered: {
    line: '#e8c468',
    fillTop: 'rgba(232, 196, 104, 0.28)',
    fillBottom: 'rgba(232, 196, 104, 0.02)',
    point: '#f5dfa0'
  },
  bothWays: {
    line: '#6fcf97',
    fillTop: 'rgba(111, 207, 151, 0.3)',
    fillBottom: 'rgba(111, 207, 151, 0.02)',
    point: '#b8f5d4'
  }
} as const;

export type ProgressSeriesKey = keyof typeof progressSeriesColors;
