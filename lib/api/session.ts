import { ApiError } from "./client";

export interface SessionUser {
  id: number;
  username: string;
  email: string;
}

export interface LoginSessionPayload {
  identifier: string;
  password: string;
}

export async function loginSession(payload: LoginSessionPayload): Promise<SessionUser> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.message ?? "Nu am putut finaliza autentificarea. Încearcă din nou.", res.status);
  }

  return data.user as SessionUser;
}
