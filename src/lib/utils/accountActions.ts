import { clearAllDecks } from '$lib/stores/decks';
import { clearAllFlashcards, clearProgressMetrics } from '$lib/stores/flashcards';
import { clearAllTags } from '$lib/stores/tags';

export function removeProgressMetrics() {
  clearProgressMetrics();
}

export function removeLibrary() {
  clearAllFlashcards();
  clearAllDecks();
  clearAllTags();
}
