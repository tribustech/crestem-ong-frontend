// lib/utils/media.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Strapi returns local uploads as root-relative paths (`/uploads/…`) and
 * provider uploads as absolute URLs. Resolves the first kind against the API
 * host and leaves the second alone.
 */
export function mediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_URL ?? ""}${url}`;
}
