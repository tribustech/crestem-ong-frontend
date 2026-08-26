import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getMe } from "@/lib/api/auth";
import { SESSION_COOKIE, ROLE_COOKIE, roleCookieOptions } from "@/lib/api/session-cookies";
import { DASHBOARD_ROOT, dashboardSegmentForRole } from "@/lib/dashboard-routes";

/**
 * Re-reads the caller's role and re-stamps the routing cookie the proxy uses to
 * pick a dashboard folder. Dashboard layouts bounce here when the folder they
 * guard doesn't match the real role, which happens when an account's role
 * changed after the cookie was written.
 */
export async function GET(request: Request) {
  const jwt = (await cookies()).get(SESSION_COOKIE)?.value;
  const home = new URL("/", request.url);
  if (!jwt) return NextResponse.redirect(home);

  let segment: string | null = null;
  try {
    const me = await getMe(jwt);
    segment = dashboardSegmentForRole(me.data.role?.type);
  } catch {
    // Session no longer usable — the dashboard has nothing to offer.
  }
  if (!segment) return NextResponse.redirect(home);

  const response = NextResponse.redirect(new URL(DASHBOARD_ROOT, request.url));
  response.cookies.set(ROLE_COOKIE, segment, roleCookieOptions);
  return response;
}
