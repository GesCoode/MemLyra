import { json, type RequestHandler } from '@sveltejs/kit';
import {
  createDeckForUser,
  deleteDeckForUser,
  listDecksForUser,
  renameDeckForUser
} from '$lib/server/decks';
import { listFlashcardsForUser } from '$lib/server/flashcards';
import { randomTagColor } from '$lib/utils/tagColors';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const decks = await listDecksForUser(locals.user.id);
  return json({ decks });
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
    return json({ error: 'Enter a deck name.' }, { status: 400 });
  }

  const existing = await listDecksForUser(locals.user.id);
  if (existing.some((deck) => deck.label.toLowerCase() === label.toLowerCase())) {
    return json({ error: 'A deck with this name already exists.' }, { status: 409 });
  }

  const deck = await createDeckForUser(locals.user.id, label, randomTagColor());
  return json({ deck });
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

  const deckId = body.id ?? '';
  const label = body.label?.trim() ?? '';

  if (!deckId || !label) {
    return json({ error: 'Enter a deck name.' }, { status: 400 });
  }

  const updated = await renameDeckForUser(locals.user.id, deckId, label);
  if (!updated) {
    return json({ error: 'Could not rename deck.' }, { status: 404 });
  }

  const decks = await listDecksForUser(locals.user.id);
  return json({ decks });
};

export const DELETE: RequestHandler = async ({ locals, url }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const deckId = url.searchParams.get('id') ?? '';
  if (!deckId) {
    return json({ error: 'Missing deck id.' }, { status: 400 });
  }

  const deleted = await deleteDeckForUser(locals.user.id, deckId);
  if (!deleted) {
    return json({ error: 'Could not delete deck.' }, { status: 404 });
  }

  const [decks, flashcards] = await Promise.all([
    listDecksForUser(locals.user.id),
    listFlashcardsForUser(locals.user.id)
  ]);
  return json({ decks, flashcards });
};
