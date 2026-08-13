"use client";

import { useEffect, useState } from "react";
import { getConversationsAction } from "@/lib/api/conversations-actions";
import type { ConversationListItem } from "@/lib/api/conversations";
import { ConversationList } from "./ConversationList";
import { ConversationThread } from "./ConversationThread";

const POLL_INTERVAL_MS = 5000;

export function MessagesPanel({ initialConversations }: { initialConversations: ConversationListItem[] }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversations[0]?.documentId ?? null);

  const refresh = async () => {
    const result = await getConversationsAction();
    if (result.data) {
      setConversations(result.data);
    }
  };

  useEffect(() => {
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const selected = conversations.find((c) => c.documentId === selectedId) ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
      <ConversationList conversations={conversations} selectedId={selectedId} onSelect={setSelectedId} />
      {selected ? (
        <ConversationThread key={selected.documentId} conversation={selected} onMessageSent={refresh} />
      ) : (
        <div className="bg-white rounded-2xl border border-border flex items-center justify-center h-[65vh]">
          <p className="text-sm text-muted-foreground">Selectează o conversație pentru a vedea mesajele.</p>
        </div>
      )}
    </div>
  );
}
