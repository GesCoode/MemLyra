import { clearAllDecks } from '$lib/stores/decks';
import { clearAllFlashcards, clearProgressMetrics } from '$lib/stores/flashcards';
import { clearAllTags } from '$lib/stores/tags';

export async function removeProgressMetrics() {
  await clearProgressMetrics();
}

export async function removeLibrary() {
  await clearAllFlashcards();
  await clearAllDecks();
  await clearAllTags();
}
