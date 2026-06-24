import type { MarketplaceCard } from '$lib/utils/marketplace';

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function marketplaceCardsToCsv(cards: MarketplaceCard[]): string {
  const lines = ['Side A,Side B'];

  for (const card of cards) {
    lines.push(`${escapeCsvField(card.sideA)},${escapeCsvField(card.sideB)}`);
  }

  return `\uFEFF${lines.join('\r\n')}`;
}

export function downloadMarketplaceDeckCsv(deck: {
  slug: string;
  cards: MarketplaceCard[];
}): void {
  const content = marketplaceCardsToCsv(deck.cards);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${deck.slug}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
