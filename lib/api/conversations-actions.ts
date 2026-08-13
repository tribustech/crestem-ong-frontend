"use server";

import { serverApiFetch } from "./server";
import { getApiErrorMessage } from "./client";
import type { ConversationListItem, ConversationMessage } from "./conversations";

export async function getConversationsAction(): Promise<{ data?: ConversationListItem[]; error?: string }> {
  try {
    const res = await serverApiFetch<{ data: ConversationListItem[] }>("/api/conversations");
    return { data: res.data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut încărca conversațiile.") };
  }
}

export async function getConversationMessagesAction(
  conversationId: string,
): Promise<{ data?: ConversationMessage[]; error?: string }> {
  try {
    const res = await serverApiFetch<{ data: ConversationMessage[] }>(
      `/api/conversations/${conversationId}/messages`,
    );
    return { data: res.data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut încărca mesajele.") };
  }
}

export async function sendMessageAction(
  conversationId: string,
  content: string,
): Promise<{ data?: ConversationMessage; error?: string }> {
  try {
    const res = await serverApiFetch<{ data: ConversationMessage }>(
      `/api/conversations/${conversationId}/messages`,
      { method: "POST", body: JSON.stringify({ content }) },
    );
    return { data: res.data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut trimite mesajul.") };
  }
}
