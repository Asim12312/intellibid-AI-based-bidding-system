/**
 * In the browser, use same-origin `/api/*` (Next rewrite) so HttpOnly cookies work.
 * On the server, use NEXT_PUBLIC_API_URL or localhost:5000.
 */
export function getApiBase() {
  const configured = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    return '';
  }
  return configured || 'http://localhost:5000';
}
