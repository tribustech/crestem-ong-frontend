import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { refreshSession } from "@/lib/api/auth";
import type { RefreshResponse } from "@/lib/api/auth";
import { isJwtExpired } from "@/lib/api/jwt";
import {
  SESSION_COOKIE,
  REFRESH_COOKIE,
  sessionCookieOptions,
  refreshCookieOptions,
} from "@/lib/api/session-cookies";

function mergedCookieHeader(request: NextRequest, overrides: Record<string, string>) {
  const cookies = new Map(request.cookies.getAll().map((c) => [c.name, c.value]));
  for (const [name, value] of Object.entries(overrides)) {
    cookies.set(name, value);
  }
  return [...cookies].map(([name, value]) => `${name}=${value}`).join("; ");
}

// Coalesces concurrent refresh attempts for the same refresh token (e.g. Link
// prefetches racing on an expired session) so the backend only rotates it once —
// the backend invalidates a refresh token on use, so a second concurrent call
// with the same token would otherwise fail and log the user out.
const pendingRefreshes = new Map<string, Promise<RefreshResponse>>();

function coalescedRefresh(refreshToken: string) {
  const existing = pendingRefreshes.get(refreshToken);
  if (existing) return existing;
  const promise = refreshSession(refreshToken).finally(() => {
    pendingRefreshes.delete(refreshToken);
  });
  pendingRefreshes.set(refreshToken, promise);
  return promise;
}

export async function proxy(request: NextRequest) {
  const jwt = request.cookies.get(SESSION_COOKIE)?.value;
  if (jwt && !isJwtExpired(jwt)) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    try {
      const fresh = await coalescedRefresh(refreshToken);

      // Rewrite the incoming request's cookie header so Server Components /
      // Server Actions further down this same request see the new JWT
      // immediately, since they can't set cookies themselves.
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set(
        "cookie",
        mergedCookieHeader(request, {
          [SESSION_COOKIE]: fresh.jwt,
          [REFRESH_COOKIE]: fresh.refreshToken,
        }),
      );

      const response = NextResponse.next({ request: { headers: requestHeaders } });
      response.cookies.set(SESSION_COOKIE, fresh.jwt, sessionCookieOptions);
      response.cookies.set(REFRESH_COOKIE, fresh.refreshToken, refreshCookieOptions);
      return response;
    } catch {
      // Refresh token invalid, expired, or revoked — fall through as unauthenticated.
    }
  }

  // API calls: let the request through with no/stale cookies so the route
  // handler's own auth check returns a proper 401 instead of an HTML redirect.
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/autentificare", request.url);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/((?!auth/).*)"],
};
