import { getSql } from '$lib/server/db';
import { findOrCreateTagForUser } from '$lib/server/tags';
import {
  appendRecentResult,
  computeStarProgress,
  type CardDirection
} from '$lib/utils/starProgress';

export type FlashcardRow = {
  id: string;
  side_a: string;
  side_b: string;
  deck_id: string | null;
  times_seen: number;
  times_correct: number;
  recent_results_a_to_b: boolean[];
  recent_results_b_to_a: boolean[];
  star: boolean;
  special_star: boolean;
  both_ways_star: boolean;
  added_at: Date;
  learned_at: Date | null;
  mastered_at: Date | null;
  both_ways_at: Date | null;
};

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

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function toFlashcard(row: FlashcardRow, tagIds: string[] = []): Flashcard {
  return {
    id: row.id,
    sideA: row.side_a,
    sideB: row.side_b,
    deckId: row.deck_id,
    tagIds,
    timesSeen: row.times_seen,
    timesCorrect: row.times_correct,
    recentResultsAToB: row.recent_results_a_to_b ?? [],
    recentResultsBToA: row.recent_results_b_to_a ?? [],
    star: row.star,
    specialStar: row.special_star,
    bothWaysStar: row.both_ways_star,
    addedAt: row.added_at.toISOString(),
    learnedAt: toIso(row.learned_at),
    masteredAt: toIso(row.mastered_at),
    bothWaysAt: toIso(row.both_ways_at)
  };
}

async function tagIdsByFlashcard(userId: string): Promise<Map<string, string[]>> {
  const sql = getSql();
  const rows = await sql<{ flashcard_id: string; tag_id: string }[]>`
    SELECT ft.flashcard_id, ft.tag_id
    FROM flashcard_tags ft
    JOIN flashcards f ON f.id = ft.flashcard_id
    WHERE f.user_id = ${userId}
  `;

  const map = new Map<string, string[]>();
  for (const row of rows) {
    const current = map.get(row.flashcard_id) ?? [];
    current.push(row.tag_id);
    map.set(row.flashcard_id, current);
  }

  return map;
}

export async function listFlashcardsForUser(userId: string): Promise<Flashcard[]> {
  const sql = getSql();
  const [rows, tagMap] = await Promise.all([
    sql<FlashcardRow[]>`
      SELECT
        id, side_a, side_b, deck_id, times_seen, times_correct,
        recent_results_a_to_b, recent_results_b_to_a,
        star, special_star, both_ways_star,
        added_at, learned_at, mastered_at, both_ways_at
      FROM flashcards
      WHERE user_id = ${userId}
      ORDER BY added_at DESC
    `,
    tagIdsByFlashcard(userId)
  ]);

  return rows.map((row) => toFlashcard(row, tagMap.get(row.id) ?? []));
}

async function setFlashcardTags(flashcardId: string, tagIds: string[]) {
  const sql = getSql();
  await sql`DELETE FROM flashcard_tags WHERE flashcard_id = ${flashcardId}`;

  if (tagIds.length === 0) return;

  for (const tagId of tagIds) {
    await sql`
      INSERT INTO flashcard_tags (flashcard_id, tag_id)
      VALUES (${flashcardId}, ${tagId})
      ON CONFLICT DO NOTHING
    `;
  }
}

export async function createFlashcardForUser(
  userId: string,
  sideA: string,
  sideB: string,
  tagIds: string[] = [],
  deckId: string | null = null
): Promise<Flashcard | null> {
  const front = sideA.trim();
  const back = sideB.trim();
  if (!front || !back) return null;

  const sql = getSql();
  const rows = await sql<FlashcardRow[]>`
    INSERT INTO flashcards (user_id, side_a, side_b, deck_id)
    VALUES (${userId}, ${front}, ${back}, ${deckId})
    RETURNING
      id, side_a, side_b, deck_id, times_seen, times_correct,
      recent_results_a_to_b, recent_results_b_to_a,
      star, special_star, both_ways_star,
      added_at, learned_at, mastered_at, both_ways_at
  `;

  const card = rows[0];
  await setFlashcardTags(card.id, tagIds);

  return toFlashcard(card, tagIds);
}

export async function updateFlashcardDeckForUser(
  userId: string,
  flashcardId: string,
  deckId: string | null
): Promise<boolean> {
  const sql = getSql();
  const rows = await sql<{ id: string }[]>`
    UPDATE flashcards
    SET deck_id = ${deckId}
    WHERE id = ${flashcardId}
      AND user_id = ${userId}
    RETURNING id
  `;

  return rows.length > 0;
}

export async function updateFlashcardTagsForUser(
  userId: string,
  flashcardId: string,
  tagIds: string[]
): Promise<boolean> {
  const sql = getSql();
  const rows = await sql<{ id: string }[]>`
    SELECT id
    FROM flashcards
    WHERE id = ${flashcardId}
      AND user_id = ${userId}
    LIMIT 1
  `;

  if (!rows[0]) return false;

  await setFlashcardTags(flashcardId, tagIds);
  return true;
}

export async function deleteFlashcardsForUser(userId: string, flashcardIds: string[]): Promise<number> {
  if (flashcardIds.length === 0) return 0;

  const sql = getSql();
  const rows = await sql<{ id: string }[]>`
    DELETE FROM flashcards
    WHERE user_id = ${userId}
      AND id = ANY(${flashcardIds})
    RETURNING id
  `;

  return rows.length;
}

export async function deleteFlashcardsInDeckForUser(userId: string, deckId: string): Promise<number> {
  const sql = getSql();
  const rows = await sql<{ id: string }[]>`
    DELETE FROM flashcards
    WHERE user_id = ${userId}
      AND deck_id = ${deckId}
    RETURNING id
  `;

  return rows.length;
}

export async function clearFlashcardsForUser(userId: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM flashcards WHERE user_id = ${userId}`;
}

function applyExerciseResult(row: FlashcardRow, correct: boolean, direction: CardDirection): FlashcardRow {
  const recentResultsAToB =
    direction === 'aToB'
      ? appendRecentResult(row.recent_results_a_to_b ?? [], correct)
      : (row.recent_results_a_to_b ?? []);
  const recentResultsBToA =
    direction === 'bToA'
      ? appendRecentResult(row.recent_results_b_to_a ?? [], correct)
      : (row.recent_results_b_to_a ?? []);
  const progress = computeStarProgress({ aToB: recentResultsAToB, bToA: recentResultsBToA });
  const now = new Date();

  return {
    ...row,
    recent_results_a_to_b: recentResultsAToB,
    recent_results_b_to_a: recentResultsBToA,
    times_seen: row.times_seen + 1,
    times_correct: row.times_correct + (correct ? 1 : 0),
    star: progress.star,
    special_star: progress.specialStar,
    both_ways_star: progress.bothWaysStar,
    learned_at: progress.star ? (row.learned_at ?? now) : null,
    mastered_at: progress.specialStar ? (row.mastered_at ?? now) : null,
    both_ways_at: progress.bothWaysStar ? (row.both_ways_at ?? now) : null
  };
}

export async function recordExerciseResultForUser(
  userId: string,
  cardId: string,
  correct: boolean,
  direction: CardDirection
): Promise<Flashcard | null> {
  const sql = getSql();
  const existing = await sql<FlashcardRow[]>`
    SELECT
      id, side_a, side_b, deck_id, times_seen, times_correct,
      recent_results_a_to_b, recent_results_b_to_a,
      star, special_star, both_ways_star,
      added_at, learned_at, mastered_at, both_ways_at
    FROM flashcards
    WHERE id = ${cardId}
      AND user_id = ${userId}
    LIMIT 1
  `;

  const current = existing[0];
  if (!current) return null;

  const updated = applyExerciseResult(current, correct, direction);
  const rows = await sql<FlashcardRow[]>`
    UPDATE flashcards
    SET
      times_seen = ${updated.times_seen},
      times_correct = ${updated.times_correct},
      recent_results_a_to_b = ${sql.json(updated.recent_results_a_to_b)},
      recent_results_b_to_a = ${sql.json(updated.recent_results_b_to_a)},
      star = ${updated.star},
      special_star = ${updated.special_star},
      both_ways_star = ${updated.both_ways_star},
      learned_at = ${updated.learned_at},
      mastered_at = ${updated.mastered_at},
      both_ways_at = ${updated.both_ways_at}
    WHERE id = ${cardId}
      AND user_id = ${userId}
    RETURNING
      id, side_a, side_b, deck_id, times_seen, times_correct,
      recent_results_a_to_b, recent_results_b_to_a,
      star, special_star, both_ways_star,
      added_at, learned_at, mastered_at, both_ways_at
  `;

  const tagMap = await tagIdsByFlashcard(userId);
  return toFlashcard(rows[0], tagMap.get(cardId) ?? []);
}

export async function recordExerciseSeenForUser(userId: string, cardId: string): Promise<Flashcard | null> {
  const sql = getSql();
  const rows = await sql<FlashcardRow[]>`
    UPDATE flashcards
    SET times_seen = times_seen + 1
    WHERE id = ${cardId}
      AND user_id = ${userId}
    RETURNING
      id, side_a, side_b, deck_id, times_seen, times_correct,
      recent_results_a_to_b, recent_results_b_to_a,
      star, special_star, both_ways_star,
      added_at, learned_at, mastered_at, both_ways_at
  `;

  if (!rows[0]) return null;

  const tagMap = await tagIdsByFlashcard(userId);
  return toFlashcard(rows[0], tagMap.get(cardId) ?? []);
}

export async function clearProgressForUser(userId: string): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE flashcards
    SET
      times_seen = 0,
      times_correct = 0,
      recent_results_a_to_b = ${sql.json([])},
      recent_results_b_to_a = ${sql.json([])},
      star = FALSE,
      special_star = FALSE,
      both_ways_star = FALSE,
      learned_at = NULL,
      mastered_at = NULL,
      both_ways_at = NULL
    WHERE user_id = ${userId}
  `;
}

export async function importFlashcardRowsForUser(
  userId: string,
  rows: { front: string; back: string; tagLabels?: string[] }[],
  deckId: string | null = null
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, skipped: 0, errors: [] };

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
      const tag = await findOrCreateTagForUser(userId, label);
      if (tag) tagIds.push(tag.id);
    }

    const created = await createFlashcardForUser(userId, front, back, tagIds, deckId);
    if (!created) {
      result.skipped += 1;
      result.errors.push(`Line ${index + 1}: could not create flashcard.`);
      continue;
    }

    result.imported += 1;
  }

  return result;
}
