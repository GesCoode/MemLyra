import { writable } from 'svelte/store';
import { guestActive, runGuestMutation } from '$lib/utils/guestStoreBridge';
import { loadGuestIntoStores } from '$lib/utils/guestSync';
import {
  guestCreateTag,
  guestDeleteTag,
  guestFindOrCreateTag,
  guestRenameTag,
  readGuestData
} from '$lib/utils/guestStorage';

export type Tag = {
  id: string;
  label: string;
  color: string;
};

export const tags = writable<Tag[]>([]);

export async function loadTags(): Promise<void> {
  if (guestActive()) {
    loadGuestIntoStores();
    return;
  }

  const response = await fetch('/api/tags');
  if (!response.ok) {
    tags.set([]);
    return;
  }

  const data = (await response.json()) as { tags: Tag[] };
  tags.set(data.tags);
}

export function clearTags() {
  tags.set([]);
}

export async function createTag(label: string): Promise<Tag | null> {
  const trimmed = label.trim();
  if (!trimmed) return null;

  if (guestActive()) {
    const result = guestCreateTag(readGuestData(), trimmed);
    runGuestMutation(() => result.data);
    return result.tag;
  }

  const response = await fetch('/api/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: trimmed })
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { tag: Tag };
  tags.update((items) => [...items, data.tag].sort((a, b) => a.label.localeCompare(b.label)));
  return data.tag;
}

export async function findOrCreateTag(label: string): Promise<Tag | null> {
  const trimmed = label.trim();
  if (!trimmed) return null;

  if (guestActive()) {
    const result = guestFindOrCreateTag(readGuestData(), trimmed);
    runGuestMutation(() => result.data);
    return result.tag;
  }

  let found: Tag | null = null;
  tags.update((items) => {
    const existing = items.find((tag) => tag.label.toLowerCase() === trimmed.toLowerCase());
    found = existing ?? null;
    return items;
  });

  if (found) return found;

  return createTag(trimmed);
}

export async function renameTag(tagId: string, label: string): Promise<boolean> {
  const trimmed = label.trim();
  if (!trimmed) return false;

  if (guestActive()) {
    runGuestMutation((data) => guestRenameTag(data, tagId, trimmed));
    return true;
  }

  const response = await fetch('/api/tags', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: tagId, label: trimmed })
  });

  if (!response.ok) return false;

  const data = (await response.json()) as { tags: Tag[] };
  tags.set(data.tags);
  return true;
}

export async function deleteTag(tagId: string): Promise<boolean> {
  if (guestActive()) {
    runGuestMutation((data) => guestDeleteTag(data, tagId));
    return true;
  }

  const response = await fetch(`/api/tags?id=${encodeURIComponent(tagId)}`, {
    method: 'DELETE'
  });

  if (!response.ok) return false;

  const data = (await response.json()) as {
    tags: Tag[];
    flashcards?: import('$lib/stores/flashcards').Flashcard[];
  };
  tags.set(data.tags);

  if (data.flashcards) {
    const { flashcards } = await import('$lib/stores/flashcards');
    flashcards.set(data.flashcards);
  }

  return true;
}

export function getTagById(tagId: string, items: Tag[]): Tag | undefined {
  return items.find((tag) => tag.id === tagId);
}

export async function clearAllTags(): Promise<void> {
  if (guestActive()) {
    runGuestMutation((data) => ({ ...data, tags: [] }));
    return;
  }

  const current = await fetch('/api/tags').then((response) =>
    response.ok ? response.json() : { tags: [] }
  ) as { tags: Tag[] };

  for (const tag of current.tags) {
    await fetch(`/api/tags?id=${encodeURIComponent(tag.id)}`, { method: 'DELETE' });
  }

  tags.set([]);
}
