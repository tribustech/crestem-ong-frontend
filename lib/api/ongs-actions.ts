"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "./server";
import { getApiErrorMessage } from "./client";

export async function deleteOngAction(documentId: string): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/ongs/${documentId}`, { method: "DELETE" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut șterge organizația.") };
  }

  revalidatePath("/dashboard/fdsc/organizatii");
  return {};
}
