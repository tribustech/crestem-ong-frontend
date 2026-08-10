"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "./server";
import { getCurrentUser } from "./session-server";
import { getApiErrorMessage } from "./client";
import type { EvaluationDetail } from "./evaluations";

async function requireNgoMember(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user || user.role?.type !== "ngo-member") {
    return "Nu ai permisiunea necesară pentru această acțiune.";
  }
  return null;
}

export interface SaveDimensionInput {
  dimensionKey: string;
  submit: boolean;
  comment: string;
  quiz: { questionId: string; answer: number }[];
}

export async function saveEvaluationDimensionAction(
  evaluationDocumentId: string,
  block: SaveDimensionInput,
): Promise<{ data?: EvaluationDetail; error?: string }> {
  const authError = await requireNgoMember();
  if (authError) return { error: authError };

  try {
    const res = await serverApiFetch<{ data: EvaluationDetail }>(`/api/evaluations/${evaluationDocumentId}`, {
      method: "PUT",
      body: JSON.stringify({ dimensions: [block] }),
    });
    revalidatePath("/dashboard/user-ong", "layout");
    return { data: res.data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut salva răspunsurile.") };
  }
}

export async function finalizeEvaluationAction(
  evaluationDocumentId: string,
): Promise<{ data?: EvaluationDetail; error?: string }> {
  const authError = await requireNgoMember();
  if (authError) return { error: authError };

  try {
    const res = await serverApiFetch<{ data: EvaluationDetail }>(
      `/api/evaluations/${evaluationDocumentId}/finish`,
      { method: "POST" },
    );
    revalidatePath("/dashboard/user-ong", "layout");
    return { data: res.data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut finaliza evaluarea.") };
  }
}
