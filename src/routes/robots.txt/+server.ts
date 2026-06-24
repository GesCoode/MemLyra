import { APP_URL } from '$lib/app';

export function GET() {
  const body = `User-agent: *
Allow: /
Allow: /try
Allow: /try/library
Allow: /marketplace
Allow: /register
Disallow: /dashboard/
Disallow: /api/
Disallow: /login
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify
Disallow: /try/exercise
Disallow: /try/marketplace

Sitemap: ${APP_URL}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'max-age=86400'
    }
  });
}
