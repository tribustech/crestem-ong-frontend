"use server";

import { serverApiFetch } from "./server";
import { getApiErrorMessage } from "./client";

export interface ChangePasswordInput {
  currentPassword: string;
  password: string;
  confirmedPassword: string;
}

export async function changePasswordAction(
  input: ChangePasswordInput,
): Promise<{ ok: true } | { error: string }> {
  try {
    await serverApiFetch("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return { ok: true };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut schimba parola. Încearcă din nou.") };
  }
}
