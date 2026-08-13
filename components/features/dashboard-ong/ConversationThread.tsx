"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getConversationMessagesAction, sendMessageAction } from "@/lib/api/conversations-actions";
import type { ConversationListItem, ConversationMessage } from "@/lib/api/conversations";
import { MessageComposer } from "./MessageComposer";

const POLL_INTERVAL_MS = 5000;

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
}

export function ConversationThread({
  conversation,
  onMessageSent,
}: {
  conversation: ConversationListItem;
  onMessageSent: () => void;
}) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const result = await getConversationMessagesAction(conversation.documentId);
      if (cancelled) return;
      if (result.data) {
        setMessages(result.data);
        setError(null);
      } else {
        setError(result.error ?? "Nu am putut încărca mesajele.");
      }
      setLoading(false);
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [conversation.documentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (content: string): Promise<boolean> => {
    const result = await sendMessageAction(conversation.documentId, content);
    if (result.error || !result.data) {
      toast.error(result.error ?? "Nu am putut trimite mesajul.");
      return false;
    }
    setMessages((prev) => [...prev, result.data as ConversationMessage]);
    onMessageSent();
    return true;
  };

  const mentor = conversation.mentor;

  return (
    <div className="bg-white rounded-2xl border border-border flex flex-col h-[65vh]">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: "#162040" }}
        >
          {mentor ? initials(mentor.nume) : "?"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "#162040" }}>
            {mentor?.nume ?? "Mentor"}
          </p>
          {mentor?.mentorOrganization && (
            <p className="text-xs text-muted-foreground truncate">{mentor.mentorOrganization}</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Se încarcă...</p>
        ) : error && messages.length === 0 ? (
          <p className="text-sm" style={{ color: "#ef4444" }}>
            {error}
          </p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nu aveți încă niciun mesaj. Scrie primul mesaj mai jos.</p>
        ) : (
          <>
            {error && (
              <p className="text-xs" style={{ color: "#ef4444" }}>
                {error}
              </p>
            )}
            {messages.map((message) => (
              <div key={message.documentId} className={`flex ${message.fromMe ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[75%] rounded-2xl px-4 py-2.5"
                  style={
                    message.fromMe
                      ? { background: "#162040", color: "white" }
                      : { background: "#f1f5f9", color: "#162040" }
                  }
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <p
                    className="text-[10px] mt-1"
                    style={{ color: message.fromMe ? "rgba(255,255,255,0.6)" : "#94a3b8" }}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageComposer onSend={handleSend} />
    </div>
  );
}
