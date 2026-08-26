"use server";

import { revalidateDashboardPath } from "./revalidate";
import { serverApiFetch } from "./server";
import { getApiErrorMessage } from "./client";

export async function deleteProgramAction(documentId: string): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/programs/${documentId}`, { method: "DELETE" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut șterge programul.") };
  }

  revalidateDashboardPath("/dashboard/fdsc/programe");
  return {};
}

export async function assignOngAction(
  programId: string,
  ongId: string,
  reportId?: string,
  phaseId?: string,
): Promise<{ error?: string }> {
  try {
    await serverApiFetch("/api/programs/assign-ongs", {
      method: "POST",
      body: JSON.stringify({
        program: programId,
        ongs: [reportId ? { ong: ongId, report: reportId, phase: phaseId } : ongId],
      }),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut adăuga organizația.") };
  }

  revalidateDashboardPath(`/dashboard/fdsc/programe/${programId}`);
  return {};
}

export async function assignPhaseEvaluationAction(
  programId: string,
  phaseId: string,
  ongId: string,
  reportId: string,
): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/programs/${programId}/phases/${phaseId}/evaluation`, {
      method: "POST",
      body: JSON.stringify({ ong: ongId, report: reportId }),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut aloca evaluarea.") };
  }

  revalidateDashboardPath(`/dashboard/fdsc/programe/${programId}`);
  return {};
}

export async function removePhaseEvaluationAction(
  programId: string,
  phaseId: string,
  ongId: string,
): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/programs/${programId}/phases/${phaseId}/evaluation/${ongId}`, {
      method: "DELETE",
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut elimina evaluarea.") };
  }

  revalidateDashboardPath(`/dashboard/fdsc/programe/${programId}`);
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

  revalidateDashboardPath(`/dashboard/fdsc/programe/${programId}`);
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

  revalidateDashboardPath(`/dashboard/fdsc/programe/${programId}`);
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

  revalidateDashboardPath(`/dashboard/fdsc/programe/${programId}`);
  return {};
}

export async function assignOngMentorAction(
  programId: string,
  ongId: string,
  mentorId: string,
): Promise<{ error?: string }> {
  try {
    await serverApiFetch("/api/programs/assign-ong-mentors", {
      method: "POST",
      body: JSON.stringify({ program: programId, ong: ongId, mentors: [mentorId] }),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut adăuga persoana resursă.") };
  }

  revalidateDashboardPath(`/dashboard/fdsc/programe/${programId}`);
  return {};
}

export async function removeOngMentorAction(
  programId: string,
  ongId: string,
  mentorId: string,
): Promise<{ error?: string }> {
  try {
    await serverApiFetch("/api/programs/remove-ong-mentors", {
      method: "POST",
      body: JSON.stringify({ program: programId, ong: ongId, mentors: [mentorId] }),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut elimina persoana resursă.") };
  }

  revalidateDashboardPath(`/dashboard/fdsc/programe/${programId}`);
  return {};
}
