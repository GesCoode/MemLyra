import type { Flashcard } from '$lib/stores/flashcards';
import type { Deck } from '$lib/stores/decks';
import type { Tag } from '$lib/stores/tags';
import { getSql } from '$lib/server/db';
import { LIMITS, trimToMax } from '$lib/server/limits';
import { toFlashcard, type FlashcardRow } from '$lib/server/flashcards';
import { toDeck } from '$lib/server/decks';
import { toTag } from '$lib/server/tags';

export type GuestMigrationPayload = {
  version: 1;
  decks: Deck[];
  tags: Tag[];
  flashcards: Flashcard[];
};

function flashcardDedupKey(sideA: string, sideB: string, deckId: string | null): string {
  return `${deckId ?? ''}\0${sideA.trim().toLowerCase()}\0${sideB.trim().toLowerCase()}`;
}

export async function importGuestBundleForUser(
  userId: string,
  payload: GuestMigrationPayload
): Promise<{ decks: number; tags: number; flashcards: number; skipped: number }> {
  const sql = getSql();

  return sql.begin(async (tx) => {
    const deckIdMap = new Map<string, string>();
    const tagIdMap = new Map<string, string>();

    const [existingDeckRows, existingTagRows, existingCardRows] = await Promise.all([
      tx<{ id: string; label: string; color: string }[]>`
        SELECT id, label, color FROM decks WHERE user_id = ${userId} ORDER BY label ASC
      `,
      tx<{ id: string; label: string; color: string }[]>`
        SELECT id, label, color FROM tags WHERE user_id = ${userId} ORDER BY label ASC
      `,
      tx<{ side_a: string; side_b: string; deck_id: string | null }[]>`
        SELECT side_a, side_b, deck_id FROM flashcards WHERE user_id = ${userId}
      `
    ]);

    const existingDecks = existingDeckRows.map(toDeck);
    const existingTags = existingTagRows.map(toTag);
    const existingCardKeys = new Set(
      existingCardRows.map((row) => flashcardDedupKey(row.side_a, row.side_b, row.deck_id))
    );

    for (const deck of payload.decks) {
      const existing = existingDecks.find(
        (entry) => entry.label.toLowerCase() === deck.label.toLowerCase()
      );
      if (existing) {
        deckIdMap.set(deck.id, existing.id);
        continue;
      }

      const rows = await tx<{ id: string; label: string; color: string }[]>`
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

      const rows = await tx<{ id: string; label: string; color: string }[]>`
        INSERT INTO tags (user_id, label, color)
        VALUES (${userId}, ${tag.label}, ${tag.color})
        RETURNING id, label, color
      `;
      tagIdMap.set(tag.id, rows[0].id);
    }

    let flashcardCount = 0;
    let skippedCount = 0;

    for (const card of payload.flashcards) {
      const deckId = card.deckId ? (deckIdMap.get(card.deckId) ?? null) : null;
      const sideA = trimToMax(card.sideA, LIMITS.maxCardSideLength);
      const sideB = trimToMax(card.sideB, LIMITS.maxCardSideLength);
      const dedupKey = flashcardDedupKey(sideA, sideB, deckId);

      if (existingCardKeys.has(dedupKey)) {
        skippedCount += 1;
        continue;
      }

      const rows = await tx<FlashcardRow[]>`
        INSERT INTO flashcards (
          user_id, side_a, side_b, deck_id,
          times_seen, times_correct,
          recent_results_a_to_b, recent_results_b_to_a,
          star, special_star, both_ways_star,
          added_at, learned_at, mastered_at, both_ways_at
        )
        VALUES (
          ${userId},
          ${sideA},
          ${sideB},
          ${deckId},
          ${Math.max(0, Math.min(card.timesSeen ?? 0, 10_000))},
          ${Math.max(0, Math.min(card.timesCorrect ?? 0, 10_000))},
          ${tx.json((card.recentResultsAToB ?? []).slice(0, 50))},
          ${tx.json((card.recentResultsBToA ?? []).slice(0, 50))},
          ${Boolean(card.star)},
          ${Boolean(card.specialStar)},
          ${Boolean(card.bothWaysStar)},
          ${card.addedAt ?? new Date().toISOString()},
          ${card.learnedAt ?? null},
          ${card.masteredAt ?? null},
          ${card.bothWaysAt ?? null}
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

      if (tagIds.length > 0) {
        await tx`
          INSERT INTO flashcard_tags (flashcard_id, tag_id)
          SELECT ${rows[0].id}, unnest(${tagIds}::uuid[])
          ON CONFLICT DO NOTHING
        `;
      }

      existingCardKeys.add(dedupKey);
      flashcardCount += 1;
    }

    return {
      decks: payload.decks.length,
      tags: payload.tags.length,
      flashcards: flashcardCount,
      skipped: skippedCount
    };
  });
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
