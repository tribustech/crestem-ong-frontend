"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "./server";
import { getApiErrorMessage } from "./client";

export async function deleteProgramAction(documentId: string): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/programs/${documentId}`, { method: "DELETE" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut șterge programul.") };
  }

  revalidatePath("/dashboard/fdsc/programe");
  return {};
}

export async function assignOngAction(
  programId: string,
  ongId: string,
  reportId?: string,
): Promise<{ error?: string }> {
  try {
    await serverApiFetch("/api/programs/assign-ongs", {
      method: "POST",
      body: JSON.stringify({
        program: programId,
        ongs: [reportId ? { ong: ongId, report: reportId } : ongId],
      }),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut adăuga organizația.") };
  }

  revalidatePath(`/dashboard/fdsc/programe/${programId}`);
  return {};
}

export async function removeOngAction(programId: string, ongId: string): Promise<{ error?: string }> {
  try {
    await serverApiFetch("/api/programs/remove-ongs", {
      method: "POST",
      body: JSON.stringify({ program: programId, ongs: [ongId] }),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut elimina organizația.") };
  }

  revalidatePath(`/dashboard/fdsc/programe/${programId}`);
  return {};
}

export async function assignMentorAction(programId: string, mentorId: string): Promise<{ error?: string }> {
  try {
    await serverApiFetch("/api/programs/assign-mentors", {
      method: "POST",
      body: JSON.stringify({ program: programId, mentors: [mentorId] }),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut adăuga persoana resursă.") };
  }

  revalidatePath(`/dashboard/fdsc/programe/${programId}`);
  return {};
}

export async function removeMentorAction(programId: string, mentorId: string): Promise<{ error?: string }> {
  try {
    await serverApiFetch("/api/programs/remove-mentors", {
      method: "POST",
      body: JSON.stringify({ program: programId, mentors: [mentorId] }),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut elimina persoana resursă.") };
  }

  revalidatePath(`/dashboard/fdsc/programe/${programId}`);
  return {};
}
