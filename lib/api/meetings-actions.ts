"use server";

import { revalidatePath } from "next/cache";
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

  revalidatePath(`/dashboard/ong/persoane-resursa/intalniri`);
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

  revalidatePath(`/dashboard/ong/persoane-resursa/intalniri`);
  return {};
}
