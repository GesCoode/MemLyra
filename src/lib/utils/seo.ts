import { APP_NAME, APP_TAGLINE, APP_URL } from '$lib/app';

export const DEFAULT_OG_LOCALE = 'en_US';

export const SEO_DESCRIPTIONS = {
  home:
    'MemLyra is a free flashcard platform. Practice vocabulary and study topics with exercises, import community decks, and track your progress — no payment required.',
  tryHub:
    'Start practicing with MemLyra for free — no account needed. Run flashcard exercises, build a library, and browse community decks.',
  tryLibrary:
    'Manage your free guest flashcard library. Add cards, organize with tags and decks, and import decks from the MemLyra marketplace.',
  tryExercise:
    'Set up a flashcard exercise on MemLyra. Choose multiple choice, typing, or flip-card modes and practice your library for free.',
  tryMarketplace:
    'Browse free flashcard decks shared by the MemLyra community. Preview cards, read ratings, and import decks into your library.',
  register:
    'Create a free MemLyra account to save your flashcard library, track learning progress, earn stars, and sync across devices.',
  login:
    'Sign in to your MemLyra account to access your flashcard library, exercises, and learning progress.',
  forgotPassword:
    'Request a password reset or new activation link for your MemLyra account.',
  resetPassword:
    'Choose a new password for your MemLyra account.',
  verifySuccess:
    'Your MemLyra account has been activated. Sign in to start practicing with your flashcard library.',
  verifyInvalid:
    'This MemLyra activation link is invalid or has expired.',
  dashboard:
    'Your MemLyra dashboard — start exercises, manage your flashcard library, and track learning progress.',
  dashboardLibrary:
    'Manage your MemLyra flashcard library. Add cards, organize decks and tags, import files, and publish to the marketplace.',
  dashboardExercise:
    'Start a flashcard exercise session in MemLyra. Filter by deck or tags and choose your quiz mode.',
  dashboardLearned:
    'Track your MemLyra learning progress — stars earned, achievements, streaks, and mastered flashcards.',
  dashboardAccount:
    'Manage your MemLyra account settings, password, theme, and library data.',
  dashboardMarketplace:
    'Browse and import community flashcard decks, or publish your own decks to the MemLyra marketplace.'
} as const;

export function resolveSiteUrl(siteUrl?: string): string {
  return siteUrl?.replace(/\/$/, '') || APP_URL;
}

export function absoluteUrl(path = '', siteUrl?: string): string {
  const base = resolveSiteUrl(siteUrl);
  if (!path || path === '/') return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildPageTitle(pageTitle: string, includeBrand = true): string {
  if (!includeBrand || pageTitle.includes(APP_NAME)) return pageTitle;
  return `${pageTitle} · ${APP_NAME}`;
}

export function truncateDescription(text: string, maxLength = 320): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

export function jsonLdScript(content: unknown): string {
  return JSON.stringify(content).replace(/</g, '\\u003c');
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: APP_NAME,
    url: APP_URL,
    email: 'contact@gesmoo.com',
    description: APP_TAGLINE
  };
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: APP_NAME,
    url: APP_URL,
    description: SEO_DESCRIPTIONS.home,
    publisher: {
      '@type': 'Organization',
      name: APP_NAME,
      url: APP_URL
    }
  };
}

export function buildSoftwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: APP_NAME,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    url: APP_URL,
    description: SEO_DESCRIPTIONS.home
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/** Paths that should appear in the XML sitemap. */
export const SITEMAP_STATIC_PATHS = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/try', changefreq: 'weekly', priority: '0.9' },
  { path: '/try/library', changefreq: 'weekly', priority: '0.8' },
  { path: '/marketplace', changefreq: 'daily', priority: '0.9' },
  { path: '/register', changefreq: 'monthly', priority: '0.5', noindex: true }
] as const;
