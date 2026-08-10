import { apiFetch } from "./client";

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

export interface LoginResponse {
  jwt: string;
  user: AuthUser;
  refreshToken: string;
}

export function login(payload: LoginPayload) {
  return apiFetch<LoginResponse>("/api/auth/local", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface CurrentUser {
  id: number;
  nume: string;
  email: string;
  role: { type: string; name: string } | null;
}

export function getMe(jwt: string) {
  return apiFetch<{ data: CurrentUser }>("/api/auth/me", {
    headers: { Authorization: `Bearer ${jwt}` },
  });
}

export interface RefreshResponse {
  jwt: string;
  refreshToken: string;
}

export function refreshSession(refreshToken: string) {
  return apiFetch<RefreshResponse>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export interface RegisterNgoPayload {
  nume: string;
  email: string;
  password: string;
  telefon: string;
  cui: string;
  numeOng: string;
  judet: string;
  localitate: string;
  website?: string;
  acordTermeniSiConditii: boolean;
}

export function registerNgo(payload: RegisterNgoPayload) {
  return apiFetch<unknown>("/api/auth/register/ngo", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
