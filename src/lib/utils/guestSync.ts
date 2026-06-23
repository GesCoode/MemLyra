import { decks } from '$lib/stores/decks';
import { flashcards } from '$lib/stores/flashcards';
import { tags } from '$lib/stores/tags';
import {
  ensureGuestSeed,
  readGuestData,
  writeGuestData,
  type GuestData
} from '$lib/utils/guestStorage';

export function syncStoresFromGuest(data: GuestData): void {
  decks.set(data.decks);
  tags.set(data.tags);
  flashcards.set(data.flashcards);
}

export function loadGuestIntoStores(): void {
  const data = ensureGuestSeed();
  syncStoresFromGuest(data);
}

export function persistGuestData(data: GuestData): void {
  writeGuestData(data);
  syncStoresFromGuest(data);
}
