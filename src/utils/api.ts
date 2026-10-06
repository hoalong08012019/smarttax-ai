export function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  if (!path.startsWith('/api/')) throw new Error('Invalid API path');
  return base + path;
}
