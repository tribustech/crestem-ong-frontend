"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "./server";
import { getApiErrorMessage } from "./client";
import type { MyOng } from "./ongs";

export async function deleteOngAction(documentId: string): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/ongs/${documentId}`, { method: "DELETE" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut șterge organizația.") };
  }

  revalidatePath("/dashboard/fdsc/organizatii");
  return {};
}

export interface UpdateMyOngInput {
  logo?: number | null;
  domeniuPrincipal?: string;
  domeniuSecundar?: string;
  website?: string;
  socialMedia?: string;
  descriere?: string;
  cuvinteCheie?: string;
}

export async function updateMyOngAction(
  input: UpdateMyOngInput,
): Promise<{ error?: string; data?: MyOng }> {
  try {
    const res = await serverApiFetch<{ data: MyOng }>("/api/ongs/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    revalidatePath("/dashboard/ong/profil");
    return { data: res.data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut actualiza profilul organizației.") };
  }
}

export async function uploadOngLogoAction(
  formData: FormData,
): Promise<{ error?: string; id?: number }> {
  const { cookies } = await import("next/headers");
  const { SESSION_COOKIE } = await import("./session-cookies");
  const { ApiError } = await import("./client");

  const cookieStore = await cookies();
  const jwt = cookieStore.get(SESSION_COOKIE)?.value;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
      body: formData,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data?.error?.message ?? "Nu am putut încărca fișierul.";
      throw new ApiError(message, res.status, data?.error?.details);
    }
    // Strapi's /api/upload returns an array of created file objects.
    const id = Array.isArray(data) ? data[0]?.id : undefined;
    return { id };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut încărca fișierul.") };
  }
}
