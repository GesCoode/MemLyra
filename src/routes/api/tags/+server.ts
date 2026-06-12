import { json, type RequestHandler } from '@sveltejs/kit';
import { listFlashcardsForUser } from '$lib/server/flashcards';
import {
  createTagForUser,
  deleteTagForUser,
  listTagsForUser,
  renameTagForUser
} from '$lib/server/tags';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const tags = await listTagsForUser(locals.user.id);
  return json({ tags });
};

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let body: { label?: string };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const label = body.label?.trim() ?? '';
  if (!label) {
    return json({ error: 'Enter a tag name.' }, { status: 400 });
  }

  const existing = await listTagsForUser(locals.user.id);
  if (existing.some((tag) => tag.label.toLowerCase() === label.toLowerCase())) {
    return json({ error: 'A tag with this name already exists.' }, { status: 409 });
  }

  const tag = await createTagForUser(locals.user.id, label);
  return json({ tag });
};

export const PATCH: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let body: { id?: string; label?: string };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const tagId = body.id ?? '';
  const label = body.label?.trim() ?? '';

  if (!tagId || !label) {
    return json({ error: 'Enter a tag name.' }, { status: 400 });
  }

  const updated = await renameTagForUser(locals.user.id, tagId, label);
  if (!updated) {
    return json({ error: 'Could not rename tag.' }, { status: 404 });
  }

  const tags = await listTagsForUser(locals.user.id);
  return json({ tags });
};

export const DELETE: RequestHandler = async ({ locals, url }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const tagId = url.searchParams.get('id') ?? '';
  if (!tagId) {
    return json({ error: 'Missing tag id.' }, { status: 400 });
  }

  const deleted = await deleteTagForUser(locals.user.id, tagId);
  if (!deleted) {
    return json({ error: 'Could not delete tag.' }, { status: 404 });
  }

  const [tags, flashcards] = await Promise.all([
    listTagsForUser(locals.user.id),
    listFlashcardsForUser(locals.user.id)
  ]);
  return json({ tags, flashcards });
};
