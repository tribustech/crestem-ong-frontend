"use server";

import { revalidateDashboardPath } from "./revalidate";
import { serverApiFetch } from "./server";
import { getApiErrorMessage } from "./client";

export interface CreateMeetingInput {
  subiect: string;
  dataOra: string;
  format: "online" | "fata_in_fata";
  linkIntalnire?: string;
  mentor: string;
  program?: string;
  activityType?: string;
  dimensiuni?: string[];
  comentarii?: string;
}

export async function createMeetingAction(
  ongDocumentId: string,
  input: CreateMeetingInput,
): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/ongs/${ongDocumentId}/meetings`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut adăuga întâlnirea.") };
  }

  revalidateDashboardPath(`/dashboard/ong/persoane-resursa/intalniri`);
  return {};
}

export async function updateMeetingAction(
  ongDocumentId: string,
  meetingDocumentId: string,
  input: CreateMeetingInput,
): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/ongs/${ongDocumentId}/meetings/${meetingDocumentId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut actualiza întâlnirea.") };
  }

  revalidateDashboardPath(`/dashboard/ong/persoane-resursa/intalniri`);
  return {};
}

export interface CreateMentorMeetingInput {
  subiect: string;
  dataOra: string;
  format: "online" | "fata_in_fata";
  linkIntalnire?: string;
  ong: string;
  program?: string;
  activityType?: string;
  dimensiuni?: string[];
  comentarii?: string;
}

export async function createMentorMeetingAction(
  input: CreateMentorMeetingInput,
): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/mentor/meetings`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut adăuga întâlnirea.") };
  }

  revalidateDashboardPath(`/dashboard/mentor/intalniri`);
  return {};
}

export async function updateMentorMeetingAction(
  meetingDocumentId: string,
  input: CreateMentorMeetingInput,
): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/mentor/meetings/${meetingDocumentId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut actualiza întâlnirea.") };
  }

  revalidateDashboardPath(`/dashboard/mentor/intalniri`);
  return {};
}

export async function cancelMentorMeetingAction(
  meetingDocumentId: string,
): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/mentor/meetings/${meetingDocumentId}/cancel`, { method: "POST" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut anula întâlnirea.") };
  }

  revalidateDashboardPath(`/dashboard/mentor/intalniri`);
  return {};
}

export async function completeMentorMeetingAction(
  meetingDocumentId: string,
): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/mentor/meetings/${meetingDocumentId}/complete`, { method: "POST" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut marca întâlnirea ca efectuată.") };
  }

  revalidateDashboardPath(`/dashboard/mentor/intalniri`);
  return {};
}

/**
 * Sends the file straight through in one request — the backend validates
 * meeting ownership/status first and only creates the upload once that
 * passes, so a rejected request never leaves an orphaned file behind.
 */
export async function uploadMentorMeetingReportAction(
  meetingDocumentId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const { cookies } = await import("next/headers");
  const { SESSION_COOKIE } = await import("./session-cookies");
  const { ApiError } = await import("./client");

  const cookieStore = await cookies();
  const jwt = cookieStore.get(SESSION_COOKIE)?.value;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(`${API_URL}/api/mentor/meetings/${meetingDocumentId}/report`, {
      method: "POST",
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
      body: formData,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data?.error?.message ?? "Nu am putut încărca raportul.";
      throw new ApiError(message, res.status, data?.error?.details);
    }
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut încărca raportul.") };
  }

  revalidateDashboardPath(`/dashboard/mentor/intalniri`);
  return {};
}
