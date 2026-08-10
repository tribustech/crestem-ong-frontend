"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "./server";
import { getApiErrorMessage } from "./client";
import type { EvaluationDetail } from "./evaluations";

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
