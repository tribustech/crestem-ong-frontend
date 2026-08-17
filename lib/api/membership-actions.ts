"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "./server";
import { getApiErrorMessage } from "./client";
import type { JoinableOng } from "./membership";

export async function leaveOngAction(ongDocumentId: string): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/me/ongs/${ongDocumentId}`, { method: "DELETE" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut părăsi organizația.") };
  }

  revalidatePath("/dashboard/user-ong/profil");
  revalidatePath("/dashboard/user-ong");
  return {};
}

export async function searchJoinableOngsAction(
  query: string,
): Promise<{ data?: JoinableOng[]; error?: string }> {
  try {
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    const res = await serverApiFetch<{ data: JoinableOng[] }>(`/api/ongs/joinable${params}`);
    return { data: res.data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut căuta organizații.") };
  }
}

export async function requestJoinOngAction(
  ongDocumentId: string,
  message?: string,
): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/ongs/${ongDocumentId}/join-requests`, {
      method: "POST",
      body: JSON.stringify(message ? { message } : {}),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut trimite cererea.") };
  }

  return {};
}
