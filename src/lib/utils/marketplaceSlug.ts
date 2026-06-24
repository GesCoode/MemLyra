/** e.g. "1000 Most Used Portuguese Words" → "1000mostusedportuguesewords" */

export function slugifyMarketplaceTitle(title: string): string {
  const asciiSlug = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 96);

  return asciiSlug || 'deck';
}
