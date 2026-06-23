import type { Flashcard } from '$lib/stores/flashcards';
import type { Deck } from '$lib/stores/decks';
import type { Tag } from '$lib/stores/tags';
import { listDecksForUser, toDeck } from '$lib/server/decks';
import { getSql } from '$lib/server/db';
import { toFlashcard, type FlashcardRow } from '$lib/server/flashcards';
import { listTagsForUser, toTag } from '$lib/server/tags';

export type GuestMigrationPayload = {
  version: 1;
  decks: Deck[];
  tags: Tag[];
  flashcards: Flashcard[];
};

async function setFlashcardTags(flashcardId: string, tagIds: string[]) {
  const sql = getSql();
  await sql`DELETE FROM flashcard_tags WHERE flashcard_id = ${flashcardId}`;

  for (const tagId of tagIds) {
    await sql`
      INSERT INTO flashcard_tags (flashcard_id, tag_id)
      VALUES (${flashcardId}, ${tagId})
      ON CONFLICT DO NOTHING
    `;
  }
}

export async function importGuestBundleForUser(
  userId: string,
  payload: GuestMigrationPayload
): Promise<{ decks: number; tags: number; flashcards: number }> {
  const sql = getSql();
  const deckIdMap = new Map<string, string>();
  const tagIdMap = new Map<string, string>();

  const [existingDecks, existingTags] = await Promise.all([
    listDecksForUser(userId),
    listTagsForUser(userId)
  ]);

  for (const deck of payload.decks) {
    const existing = existingDecks.find(
      (entry) => entry.label.toLowerCase() === deck.label.toLowerCase()
    );
    if (existing) {
      deckIdMap.set(deck.id, existing.id);
      continue;
    }

    const rows = await sql<{ id: string; label: string; color: string }[]>`
      INSERT INTO decks (user_id, label, color)
      VALUES (${userId}, ${deck.label}, ${deck.color})
      RETURNING id, label, color
    `;
    deckIdMap.set(deck.id, rows[0].id);
  }

  for (const tag of payload.tags) {
    const existing = existingTags.find(
      (entry) => entry.label.toLowerCase() === tag.label.toLowerCase()
    );
    if (existing) {
      tagIdMap.set(tag.id, existing.id);
      continue;
    }

    const rows = await sql<{ id: string; label: string; color: string }[]>`
      INSERT INTO tags (user_id, label, color)
      VALUES (${userId}, ${tag.label}, ${tag.color})
      RETURNING id, label, color
    `;
    tagIdMap.set(tag.id, rows[0].id);
  }

  let flashcardCount = 0;

  for (const card of payload.flashcards) {
    const deckId = card.deckId ? (deckIdMap.get(card.deckId) ?? null) : null;
    const rows = await sql<FlashcardRow[]>`
      INSERT INTO flashcards (
        user_id, side_a, side_b, deck_id,
        times_seen, times_correct,
        recent_results_a_to_b, recent_results_b_to_a,
        star, special_star, both_ways_star,
        added_at, learned_at, mastered_at, both_ways_at
      )
      VALUES (
        ${userId}, ${card.sideA.trim()}, ${card.sideB.trim()}, ${deckId},
        ${card.timesSeen}, ${card.timesCorrect},
        ${sql.json(card.recentResultsAToB)}, ${sql.json(card.recentResultsBToA)},
        ${card.star}, ${card.specialStar}, ${card.bothWaysStar},
        ${card.addedAt}, ${card.learnedAt}, ${card.masteredAt}, ${card.bothWaysAt}
      )
      RETURNING
        id, side_a, side_b, deck_id, times_seen, times_correct,
        recent_results_a_to_b, recent_results_b_to_a,
        star, special_star, both_ways_star,
        added_at, learned_at, mastered_at, both_ways_at
    `;

    const tagIds = card.tagIds
      .map((id) => tagIdMap.get(id))
      .filter((id): id is string => Boolean(id));

    await setFlashcardTags(rows[0].id, tagIds);
    flashcardCount += 1;
  }

  return {
    decks: payload.decks.length,
    tags: payload.tags.length,
    flashcards: flashcardCount
  };
}

export async function listUserLibrary(userId: string) {
  const sql = getSql();

  const [deckRows, tagRows, cardRows, tagLinkRows] = await Promise.all([
    sql<{ id: string; label: string; color: string }[]>`
      SELECT id, label, color FROM decks WHERE user_id = ${userId} ORDER BY label ASC
    `,
    sql<{ id: string; label: string; color: string }[]>`
      SELECT id, label, color FROM tags WHERE user_id = ${userId} ORDER BY label ASC
    `,
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
    sql<{ flashcard_id: string; tag_id: string }[]>`
      SELECT ft.flashcard_id, ft.tag_id
      FROM flashcard_tags ft
      JOIN flashcards f ON f.id = ft.flashcard_id
      WHERE f.user_id = ${userId}
    `
  ]);

  const tagMap = new Map<string, string[]>();
  for (const row of tagLinkRows) {
    const current = tagMap.get(row.flashcard_id) ?? [];
    current.push(row.tag_id);
    tagMap.set(row.flashcard_id, current);
  }

  return {
    decks: deckRows.map(toDeck),
    tags: tagRows.map(toTag),
    flashcards: cardRows.map((row) => toFlashcard(row, tagMap.get(row.id) ?? []))
  };
}
