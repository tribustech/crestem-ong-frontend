"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "./server";
import { getApiErrorMessage, parseApiError } from "./client";

export interface CreateMentorInput {
  role: "mentor";
  nume: string;
  email: string;
  bio?: string;
  avatar?: number;
  dimensiuni?: string[];
  ariiDeExpertiza?: string[];
}

export interface CreateStaffInput {
  role: "super-admin" | "editor-fdsc";
  nume: string;
  email: string;
}

export type CreateFdscUserInput = CreateMentorInput | CreateStaffInput;

export async function createFdscUserAction(
  input: CreateFdscUserInput,
): Promise<{ error?: string; fieldErrors?: Record<string, string> }> {
  const path = input.role === "mentor" ? "/api/auth/register/mentor" : "/api/auth/register/staff";
  const { role, ...body } = input;

  try {
    await serverApiFetch(path, {
      method: "POST",
      body: JSON.stringify(input.role === "mentor" ? body : { ...body, role }),
    });
  } catch (err) {
    const parsed = parseApiError(err, "Nu am putut crea utilizatorul.");
    return { error: parsed.message || undefined, fieldErrors: parsed.fieldErrors };
  }

  revalidatePath("/dashboard/fdsc/utilizatori");
  revalidatePath("/dashboard/fdsc/persoane-resursa");
  return {};
}

export interface UpdateMentorInput {
  role: "mentor";
  nume: string;
  bio?: string;
  avatar?: number | null;
  dimensiuni?: string[];
  ariiDeExpertiza?: string[];
}

export interface UpdateStaffInput {
  role: "super-admin" | "editor-fdsc";
  nume: string;
}

export type UpdateFdscUserInput = UpdateMentorInput | UpdateStaffInput;

export async function updateFdscUserAction(
  documentId: string,
  input: UpdateFdscUserInput,
): Promise<{ error?: string; fieldErrors?: Record<string, string> }> {
  const body =
    input.role === "mentor"
      ? {
          nume: input.nume,
          bio: input.bio,
          avatar: input.avatar,
          dimensiuni: input.dimensiuni,
          ariiDeExpertiza: input.ariiDeExpertiza,
        }
      : { nume: input.nume };

  try {
    await serverApiFetch(`/api/admin/users/${documentId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  } catch (err) {
    const parsed = parseApiError(err, "Nu am putut actualiza utilizatorul.");
    return { error: parsed.message || undefined, fieldErrors: parsed.fieldErrors };
  }

  revalidatePath("/dashboard/fdsc/utilizatori");
  revalidatePath("/dashboard/fdsc/persoane-resursa");
  revalidatePath("/dashboard/fdsc/persoane-resursa/[documentId]", "page");
  return {};
}

export async function uploadUserAvatarAction(
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
    const id = Array.isArray(data) ? data[0]?.id : undefined;
    if (typeof id !== "number") {
      return { error: "Nu am putut încărca fișierul." };
    }
    return { id };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut încărca fișierul.") };
  }
}
