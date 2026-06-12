import { getSql } from '$lib/server/db';
import { randomTagColor } from '$lib/utils/tagColors';

export type TagRow = {
  id: string;
  label: string;
  color: string;
};

export function toTag(row: TagRow) {
  return {
    id: row.id,
    label: row.label,
    color: row.color
  };
}

export async function listTagsForUser(userId: string) {
  const sql = getSql();
  const rows = await sql<TagRow[]>`
    SELECT id, label, color
    FROM tags
    WHERE user_id = ${userId}
    ORDER BY label ASC
  `;

  return rows.map(toTag);
}

export async function createTagForUser(userId: string, label: string) {
  const sql = getSql();
  const trimmed = label.trim();
  const color = randomTagColor();

  const rows = await sql<TagRow[]>`
    INSERT INTO tags (user_id, label, color)
    VALUES (${userId}, ${trimmed}, ${color})
    RETURNING id, label, color
  `;

  return toTag(rows[0]);
}

export async function findOrCreateTagForUser(userId: string, label: string) {
  const sql = getSql();
  const trimmed = label.trim();

  const existing = await sql<TagRow[]>`
    SELECT id, label, color
    FROM tags
    WHERE user_id = ${userId}
      AND lower(label) = ${trimmed.toLowerCase()}
    LIMIT 1
  `;

  if (existing[0]) return toTag(existing[0]);

  return createTagForUser(userId, trimmed);
}

export async function renameTagForUser(userId: string, tagId: string, label: string): Promise<boolean> {
  const sql = getSql();
  const trimmed = label.trim();

  const rows = await sql<{ id: string }[]>`
    UPDATE tags
    SET label = ${trimmed}
    WHERE id = ${tagId}
      AND user_id = ${userId}
    RETURNING id
  `;

  return rows.length > 0;
}

export async function deleteTagForUser(userId: string, tagId: string): Promise<boolean> {
  const sql = getSql();

  const rows = await sql<{ id: string }[]>`
    DELETE FROM tags
    WHERE id = ${tagId}
      AND user_id = ${userId}
    RETURNING id
  `;

  return rows.length > 0;
}

export async function clearTagsForUser(userId: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM tags WHERE user_id = ${userId}`;
}
