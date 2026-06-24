export function sanitizeRedirectPath(path: string | null | undefined, fallback = '/dashboard'): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return fallback;
  }

  if (path.startsWith('/login') || path.startsWith('/register')) {
    return fallback;
  }

  return path;
}

export function loginHref(returnTo: string, fallback = '/dashboard'): string {
  const safePath = sanitizeRedirectPath(returnTo, fallback);
  return `/login?redirect=${encodeURIComponent(safePath)}`;
}
