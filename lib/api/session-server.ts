import { serverApiFetch } from "./server";
import { ApiError } from "./client";
import type { CurrentUser } from "./auth";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const res = await serverApiFetch<{ data: CurrentUser }>("/api/auth/me");
    return res.data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return null;
    }
    throw err;
  }
}
