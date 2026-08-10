"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { serverApiFetch } from "./server";
import { getApiErrorMessage } from "./client";

export async function startEvaluationAction(
  members: string[],
  program?: string,
): Promise<{ error?: string }> {
  try {
    await serverApiFetch("/api/reports/start", {
      method: "POST",
      body: JSON.stringify(program ? { program, members } : { members }),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut porni evaluarea.") };
  }

  revalidatePath("/dashboard/ong/programe");
  revalidatePath("/dashboard/ong/evaluari");
  return {};
}

export async function addReportMembersAction(
  reportId: string,
  members: string[],
): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/reports/${reportId}/members`, {
      method: "POST",
      body: JSON.stringify({ members }),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut adăuga membrii.") };
  }

  revalidatePath(`/dashboard/ong/evaluari/${reportId}`);
  return {};
}

export async function finishReportAction(reportId: string): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/reports/${reportId}/finish`, { method: "POST" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut finaliza evaluarea.") };
  }

  revalidatePath(`/dashboard/ong/evaluari/${reportId}`);
  revalidatePath("/dashboard/ong/evaluari");
  revalidatePath("/dashboard/ong/programe");
  return {};
}

export async function deleteReportAction(reportId: string): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/reports/${reportId}`, { method: "DELETE" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut șterge runda.") };
  }

  revalidatePath("/dashboard/ong/evaluari");
  redirect("/dashboard/ong/evaluari");
}
