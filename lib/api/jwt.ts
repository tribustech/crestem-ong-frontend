interface JwtPayload {
  exp?: number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/**
 * Decodes (without verifying) the JWT's `exp` claim to decide whether it's
 * worth attempting a refresh before spending a round-trip on a request that
 * would just 401. Strapi remains the source of truth: it verifies the
 * signature on every real API call.
 */
export function isJwtExpired(token: string, bufferMs = 10_000): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000 - bufferMs;
}
