"use server";

import { cookies } from "next/headers";
import { serverApiFetch } from "./server";
import { getApiErrorMessage } from "./client";
import { SESSION_COOKIE, REFRESH_COOKIE } from "./session-cookies";

export interface DeleteAccountInput {
  currentPassword: string;
  confirmare: string;
}

/**
 * Anonymization is immediate and irreversible, so the session cookies are
 * dropped in the same round trip — the JWT would otherwise stay valid until it
 * expires against an account that no longer authenticates.
 */
export async function deleteAccountAction(
  input: DeleteAccountInput,
): Promise<{ ok: true } | { error: string }> {
  try {
    await serverApiFetch("/api/auth/delete-account", {
      method: "POST",
      body: JSON.stringify(input),
    });
  } catch (err) {
    return {
      error: getApiErrorMessage(err, "Nu am putut șterge contul. Încearcă din nou."),
    };
  }

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
  return { ok: true };
}
