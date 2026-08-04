import { NextResponse } from "next/server";
import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

const SESSION_COOKIE = "crestem_session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const identifier = body?.identifier;
  const password = body?.password;

  if (typeof identifier !== "string" || typeof password !== "string") {
    return NextResponse.json({ message: "Date de autentificare invalide." }, { status: 400 });
  }

  try {
    const { jwt, user } = await login({ identifier, password });
    const response = NextResponse.json({ user });
    response.cookies.set(SESSION_COOKIE, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Nu am putut finaliza autentificarea. Încearcă din nou.";
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ message }, { status: status || 500 });
  }
}
