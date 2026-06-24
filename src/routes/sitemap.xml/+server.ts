import { getAppUrl } from '$lib/server/appUrl';
import { listMarketplaceDecksForSitemap } from '$lib/server/marketplace';
import { marketplaceDeckPath } from '$lib/utils/marketplace';
import { SITEMAP_STATIC_PATHS } from '$lib/utils/seo';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc: string, lastmod?: string, changefreq?: string, priority?: string): string {
  const parts = [`<loc>${escapeXml(loc)}</loc>`];

  if (lastmod) {
    parts.push(`<lastmod>${escapeXml(lastmod)}</lastmod>`);
  }

  if (changefreq) {
    parts.push(`<changefreq>${changefreq}</changefreq>`);
  }

  if (priority) {
    parts.push(`<priority>${priority}</priority>`);
  }

  return `<url>${parts.join('')}</url>`;
}

export async function GET({ url }) {
  const appUrl = getAppUrl(url);
  const today = new Date().toISOString().slice(0, 10);
  const decks = await listMarketplaceDecksForSitemap();

  const staticUrls = SITEMAP_STATIC_PATHS.filter((entry) => !('noindex' in entry && entry.noindex)).map(
    (entry) => urlEntry(`${appUrl}${entry.path}`, today, entry.changefreq, entry.priority)
  );

  const deckUrls = decks.map((deck) =>
    urlEntry(
      `${appUrl}${marketplaceDeckPath(deck)}`,
      deck.updatedAt.slice(0, 10),
      'weekly',
      '0.8'
    )
  );

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...deckUrls].join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'max-age=3600'
    }
  });
}
