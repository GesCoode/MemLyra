import { getSql } from '$lib/server/db';

export type DeckRow = {
  id: string;
  label: string;
  color: string;
};

export const BASE_DECK_LABEL = 'base';
export const BASE_DECK_COLOR = 'hsl(210 68% 62%)';

export function toDeck(row: DeckRow) {
  return {
    id: row.id,
    label: row.label,
    color: row.color
  };
}

export async function listDecksForUser(userId: string) {
  const sql = getSql();
  const rows = await sql<DeckRow[]>`
    SELECT id, label, color
    FROM decks
    WHERE user_id = ${userId}
    ORDER BY label ASC
  `;

  return rows.map(toDeck);
}

export async function createDeckForUser(userId: string, label: string, color: string) {
  const sql = getSql();
  const trimmed = label.trim();

  const rows = await sql<DeckRow[]>`
    INSERT INTO decks (user_id, label, color)
    VALUES (${userId}, ${trimmed}, ${color})
    RETURNING id, label, color
  `;

  return toDeck(rows[0]);
}

export async function createBaseDeckForUser(userId: string) {
  return createDeckForUser(userId, BASE_DECK_LABEL, BASE_DECK_COLOR);
}

export async function renameDeckForUser(userId: string, deckId: string, label: string): Promise<boolean> {
  const sql = getSql();
  const trimmed = label.trim();

  const rows = await sql<{ id: string }[]>`
    UPDATE decks
    SET label = ${trimmed}
    WHERE id = ${deckId}
      AND user_id = ${userId}
    RETURNING id
  `;

  return rows.length > 0;
}

export async function deleteDeckForUser(userId: string, deckId: string): Promise<boolean> {
  const sql = getSql();

  const rows = await sql<{ id: string }[]>`
    DELETE FROM decks
    WHERE id = ${deckId}
      AND user_id = ${userId}
    RETURNING id
  `;

  return rows.length > 0;
}
