import { NextResponse } from "next/server";
import { login, getMe } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  SESSION_COOKIE,
  REFRESH_COOKIE,
  sessionCookieOptions,
  refreshCookieOptions,
  ROLE_COOKIE,
  roleCookieOptions,
} from "@/lib/api/session-cookies";
import { dashboardSegmentForRole } from "@/lib/dashboard-routes";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const identifier = body?.identifier;
  const password = body?.password;

  if (typeof identifier !== "string" || typeof password !== "string") {
    return NextResponse.json({ message: "Date de autentificare invalide." }, { status: 400 });
  }

  try {
    const { jwt, user, refreshToken, isFirstLogin } = await login({ identifier, password });
    const me = await getMe(jwt).catch(() => null);

    const response = NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email, role: me?.data.role ?? null },
      isFirstLogin: isFirstLogin ?? false,
    });
    response.cookies.set(SESSION_COOKIE, jwt, sessionCookieOptions);
    if (refreshToken) {
      response.cookies.set(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
    }
    // Lets the proxy rewrite `/dashboard/*` onto this role's folder without
    // re-asking the backend who the visitor is on every request.
    const segment = dashboardSegmentForRole(me?.data.role?.type);
    if (segment) {
      response.cookies.set(ROLE_COOKIE, segment, roleCookieOptions);
    }
    return response;
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Nu am putut finaliza autentificarea. Încearcă din nou.";
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ message }, { status: status || 500 });
  }
}
