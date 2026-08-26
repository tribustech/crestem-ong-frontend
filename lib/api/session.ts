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

export interface LoginSessionResult {
  user: SessionUser;
  /** Only the very first login of an account reports true. */
  isFirstLogin: boolean;
}

export function loginSession(payload: LoginSessionPayload) {
  return localApiFetch<LoginSessionResult>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logoutSession() {
  return localApiFetch<void>("/api/auth/logout", { method: "POST" });
}
