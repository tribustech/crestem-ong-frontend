"use server";

import { getApiErrorMessage, ApiError } from "./client";
import { getCurrentUser } from "./session-server";
import { SESSION_COOKIE } from "./session-cookies";
import { isFdscStaff } from "@/lib/roles";

export interface UploadedPageImage {
  id: number;
  url: string;
  name: string;
}

/**
 * Uploads one image for a page block to Strapi's `/api/upload` and returns the
 * created file's `id` + `url`. The page builder holds these in block data; a
 * future `page` content type will reference the same file by `id`.
 *
 * A Server Action is an addressable endpoint, so the FDSC-staff check lives here
 * as well as in the layout that renders the builder.
 */
export async function uploadPageImageAction(
  formData: FormData,
): Promise<{ error?: string; image?: UploadedPageImage }> {
  const user = await getCurrentUser();
  if (!isFdscStaff(user?.role?.type)) {
    return { error: "Nu ai permisiunea necesară pentru această acțiune." };
  }

  const { cookies } = await import("next/headers");
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
      const message = data?.error?.message ?? "Nu am putut încărca imaginea.";
      throw new ApiError(message, res.status, data?.error?.details);
    }
    const file = Array.isArray(data) ? data[0] : undefined;
    if (typeof file?.id !== "number" || typeof file?.url !== "string") {
      return { error: "Nu am putut încărca imaginea." };
    }
    return {
      image: {
        id: file.id,
        url: file.url,
        name: typeof file.name === "string" ? file.name : "imagine",
      },
    };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut încărca imaginea.") };
  }
}
