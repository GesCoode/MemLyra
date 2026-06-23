/** App identity — used in titles, emails, and shared UI copy. */
export const APP_NAME = 'MemLyra';

export const APP_TAGLINE = 'Your free study platform';

export const APP_URL = 'https://memlyra.com';

/** Navbar and homepage CTA for no-login practice (`/try`). */
export const PRACTICE_ENTRY_LABEL = 'Start practicing';

/** Single heading on the guest practice hub (`/try`). */
export const PRACTICE_HUB_TITLE = 'Practice';

export const SESSION_STORAGE_KEYS = {
  theme: 'memlyra-theme',
  verification: 'memlyra-verification'
} as const;

/** localStorage key for guest practice data (decks, tags, flashcards + hidden progress). */
export const GUEST_DATA_KEY = 'memlyra-guest-data';
