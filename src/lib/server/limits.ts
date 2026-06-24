export const LIMITS = {
  maxImportRows: 5_000,
  maxGuestFlashcards: 2_000,
  maxGuestDecks: 200,
  maxGuestTags: 500,
  maxMarketplaceCards: 5_000,
  maxMarketplaceTitle: 120,
  maxMarketplaceDescription: 500,
  maxDeckLabel: 120,
  maxTagLabel: 80,
  maxUserName: 80,
  maxCardSideLength: 2_000,
  maxGuestPayloadBytes: 2_000_000
} as const;

export function trimToMax(value: string, max: number): string {
  return value.trim().slice(0, max);
}
