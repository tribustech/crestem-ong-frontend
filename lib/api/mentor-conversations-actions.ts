"use server";

import { serverApiFetch } from "./server";
import { getApiErrorMessage } from "./client";
import type { ConversationListItem, ConversationMessage } from "./mentor-conversations";

export async function getMentorConversationsAction(): Promise<{ data?: ConversationListItem[]; error?: string }> {
  try {
    const res = await serverApiFetch<{ data: ConversationListItem[] }>("/api/mentor/conversations");
    return { data: res.data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut încărca conversațiile.") };
  }
}

export async function getMentorConversationMessagesAction(
  conversationId: string,
): Promise<{ data?: ConversationMessage[]; error?: string }> {
  try {
    const res = await serverApiFetch<{ data: ConversationMessage[] }>(
      `/api/mentor/conversations/${conversationId}/messages`,
    );
    return { data: res.data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut încărca mesajele.") };
  }
}

export async function sendMentorMessageAction(
  conversationId: string,
  content: string,
): Promise<{ data?: ConversationMessage; error?: string }> {
  try {
    const res = await serverApiFetch<{ data: ConversationMessage }>(
      `/api/mentor/conversations/${conversationId}/messages`,
      { method: "POST", body: JSON.stringify({ content }) },
    );
    return { data: res.data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut trimite mesajul.") };
  }
}
