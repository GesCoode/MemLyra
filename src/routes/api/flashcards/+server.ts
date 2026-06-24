import { json, type RequestHandler } from '@sveltejs/kit';
import {
  clearFlashcardsForUser,
  clearProgressForUser,
  createFlashcardForUser,
  deleteFlashcardsForUser,
  deleteFlashcardsInDeckForUser,
  importFlashcardRowsForUser,
  listFlashcardsForUser,
  recordExerciseResultForUser,
  recordExerciseSeenForUser,
  updateFlashcardDeckForUser,
  updateFlashcardTagsForUser
} from '$lib/server/flashcards';
import { listTagsForUser } from '$lib/server/tags';
import { checkRateLimit, rateLimitKey } from '$lib/server/rateLimit';
import type { CardDirection } from '$lib/utils/starProgress';

async function enforceWriteRateLimit(
  action: string,
  ip: string,
  userId: string,
  limit: number,
  windowMs: number
) {
  const allowed = await checkRateLimit(rateLimitKey(`flashcards-${action}`, ip, userId), limit, windowMs);
  if (!allowed) {
    return json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  return null;
}

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const flashcards = await listFlashcardsForUser(locals.user.id);
  return json({ flashcards });
};

export const POST: RequestHandler = async ({ locals, request, url, getClientAddress }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const action = url.searchParams.get('action');
  const ip = getClientAddress();

  if (action === 'import') {
    const limited = await enforceWriteRateLimit('import', ip, locals.user.id, 10, 60 * 60 * 1000);
    if (limited) return limited;

    let body: { rows?: { front: string; back: string; tagLabels?: string[] }[]; deckId?: string | null };

    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const rows = body.rows ?? [];
    if (rows.length > 5000) {
      return json({ error: 'Import limited to 5000 cards at a time.' }, { status: 400 });
    }

    const result = await importFlashcardRowsForUser(
      locals.user.id,
      body.rows ?? [],
      body.deckId ?? null
    );
    const [flashcards, tags] = await Promise.all([
      listFlashcardsForUser(locals.user.id),
      listTagsForUser(locals.user.id)
    ]);
    return json({ result, flashcards, tags });
  }

  if (action === 'clear-progress') {
    const limited = await enforceWriteRateLimit('clear-progress', ip, locals.user.id, 10, 60 * 60 * 1000);
    if (limited) return limited;

    await clearProgressForUser(locals.user.id);
    const flashcards = await listFlashcardsForUser(locals.user.id);
    return json({ flashcards });
  }

  if (action === 'clear-all') {
    const limited = await enforceWriteRateLimit('clear-all', ip, locals.user.id, 5, 60 * 60 * 1000);
    if (limited) return limited;

    await clearFlashcardsForUser(locals.user.id);
    return json({ flashcards: [] });
  }

  const limited = await enforceWriteRateLimit('create', ip, locals.user.id, 120, 60 * 60 * 1000);
  if (limited) return limited;

  let body: {
    sideA?: string;
    sideB?: string;
    tagIds?: string[];
    deckId?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const card = await createFlashcardForUser(
    locals.user.id,
    body.sideA ?? '',
    body.sideB ?? '',
    body.tagIds ?? [],
    body.deckId ?? null
  );

  if (!card) {
    return json({ error: 'Enter both sides of the flashcard.' }, { status: 400 });
  }

  return json({ card });
};

export const PATCH: RequestHandler = async ({ locals, request, url }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const action = url.searchParams.get('action');

  let body: {
    id?: string;
    deckId?: string | null;
    tagIds?: string[];
    correct?: boolean;
    direction?: CardDirection;
    seenOnly?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const cardId = body.id ?? '';
  if (!cardId) {
    return json({ error: 'Missing flashcard id.' }, { status: 400 });
  }

  if (action === 'progress') {
    let card = null;

    if (body.seenOnly) {
      card = await recordExerciseSeenForUser(locals.user.id, cardId);
    } else if (body.direction) {
      card = await recordExerciseResultForUser(
        locals.user.id,
        cardId,
        Boolean(body.correct),
        body.direction
      );
    }

    if (!card) {
      return json({ error: 'Could not update progress.' }, { status: 404 });
    }

    return json({ card });
  }

  if (body.tagIds) {
    const updated = await updateFlashcardTagsForUser(locals.user.id, cardId, body.tagIds);
    if (!updated) {
      return json({ error: 'Could not update tags.' }, { status: 404 });
    }
  } else {
    const updated = await updateFlashcardDeckForUser(
      locals.user.id,
      cardId,
      body.deckId ?? null
    );
    if (!updated) {
      return json({ error: 'Could not update deck.' }, { status: 404 });
    }
  }

  const flashcards = await listFlashcardsForUser(locals.user.id);
  return json({ flashcards });
};

export const DELETE: RequestHandler = async ({ locals, url, getClientAddress }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const ip = getClientAddress();
  const limited = await enforceWriteRateLimit('delete', ip, locals.user.id, 60, 60 * 60 * 1000);
  if (limited) return limited;

  const deckId = url.searchParams.get('deckId');
  const idsParam = url.searchParams.get('ids');

  if (deckId) {
    await deleteFlashcardsInDeckForUser(locals.user.id, deckId);
  } else if (idsParam) {
    const ids = idsParam.split(',').filter(Boolean);
    await deleteFlashcardsForUser(locals.user.id, ids);
  } else {
    return json({ error: 'Missing ids or deckId.' }, { status: 400 });
  }

  const flashcards = await listFlashcardsForUser(locals.user.id);
  return json({ flashcards });
};
