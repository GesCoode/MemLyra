import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { randomTagColor } from '$lib/utils/tagColors';

const STORAGE_KEY = 'memlyra-tags';

export type Tag = {
  id: string;
  label: string;
  color: string;
};

export const tags = writable<Tag[]>([]);

function save(items: Tag[]) {
  if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function createId(): string {
  return crypto.randomUUID();
}

function normalizeTag(tag: Tag): Tag {
  return {
    ...tag,
    color: tag.color ?? randomTagColor()
  };
}

export function initTags() {
  if (!browser) return;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    tags.set([]);
    return;
  }

  try {
    const parsed = JSON.parse(stored) as Tag[];
    const normalized = parsed.map(normalizeTag);
    tags.set(normalized);
    if (normalized.some((tag, index) => !parsed[index]?.color)) {
      save(normalized);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    tags.set([]);
  }
}

export function createTag(label: string): Tag | null {
  const trimmed = label.trim();
  if (!trimmed) return null;

  let created: Tag | null = null;

  tags.update((items) => {
    if (items.some((tag) => tag.label.toLowerCase() === trimmed.toLowerCase())) {
      return items;
    }

    created = { id: createId(), label: trimmed, color: randomTagColor() };
    const next = [...items, created];
    save(next);
    return next;
  });

  return created;
}

export function findOrCreateTag(label: string): Tag | null {
  const trimmed = label.trim();
  if (!trimmed) return null;

  let found: Tag | null = null;

  tags.update((items) => {
    const existing = items.find((tag) => tag.label.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      found = existing;
      return items;
    }

    found = { id: createId(), label: trimmed, color: randomTagColor() };
    const next = [...items, found];
    save(next);
    return next;
  });

  return found;
}

export function renameTag(tagId: string, label: string): boolean {
  const trimmed = label.trim();
  if (!trimmed) return false;

  let ok = false;

  tags.update((items) => {
    const tag = items.find((item) => item.id === tagId);
    if (!tag) return items;

    if (items.some((item) => item.id !== tagId && item.label.toLowerCase() === trimmed.toLowerCase())) {
      return items;
    }

    ok = true;
    if (tag.label === trimmed) return items;

    const next = items.map((item) => (item.id === tagId ? { ...item, label: trimmed } : item));
    save(next);
    return next;
  });

  return ok;
}

export function deleteTag(tagId: string) {
  tags.update((items) => {
    const next = items.filter((tag) => tag.id !== tagId);
    save(next);
    return next;
  });
}

export function getTagById(tagId: string, items: Tag[]): Tag | undefined {
  return items.find((tag) => tag.id === tagId);
}

export function clearAllTags() {
  tags.set([]);
  save([]);
}
