import { localApiFetch } from "./local";

export interface SessionUser {
  id: number;
  username: string;
  email: string;
  role: { type: string; name: string } | null;
}

export interface LoginSessionPayload {
  identifier: string;
  password: string;
}

export function loginSession(payload: LoginSessionPayload) {
  return localApiFetch<{ user: SessionUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((res) => res.user);
}

export function logoutSession() {
  return localApiFetch<void>("/api/auth/logout", { method: "POST" });
}
