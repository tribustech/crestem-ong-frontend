export const SESSION_COOKIE = "crestem_session";
export const REFRESH_COOKIE = "crestem_refresh";

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

/**
 * Caches the dashboard folder the signed-in role maps to, so the proxy can
 * rewrite `/dashboard/*` onto it without an `/api/auth/me` round-trip per
 * request. Purely a routing hint — every dashboard layout still verifies the
 * real role server-side, so a forged value only earns a redirect.
 */
export const ROLE_COOKIE = "crestem_dashboard";

export const roleCookieOptions = {
  ...refreshCookieOptions,
};
