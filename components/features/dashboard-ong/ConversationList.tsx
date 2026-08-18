"use client";

import type { ConversationListItem } from "@/lib/api/conversations";

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

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: ConversationListItem[];
  selectedId: string | null;
  onSelect: (documentId: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-bold text-base" style={{ color: "#162040" }}>
          Conversații
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {conversations.length} {conversations.length === 1 ? "persoană resursă" : "persoane resursă"}
        </p>
      </div>
      <div className="divide-y divide-border max-h-[65vh] overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">
            Nu ai încă mentori alocați pentru programele tale.
          </p>
        ) : (
          conversations.map((conversation) => {
            const mentor = conversation.mentor;
            if (!mentor) return null;
            const isSelected = conversation.documentId === selectedId;
            return (
              <button
                key={conversation.documentId}
                type="button"
                onClick={() => onSelect(conversation.documentId)}
                className="w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-50"
                style={{ background: isSelected ? "#f0faf6" : "transparent" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: "#162040" }}
                >
                  {initials(mentor.nume)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate" style={{ color: "#162040" }}>
                      {mentor.nume}
                    </p>
                    {conversation.lastMessage && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTime(conversation.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {conversation.program && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p
                        className="text-xs truncate"
                        style={{ color: isSelected ? "#2dbe8f" : "#94a3b8", fontWeight: isSelected ? 600 : 400 }}
                      >
                        {conversation.program.name}
                      </p>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#2dbe8f" }} />
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {conversation.unread && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#2dbe8f" }} />
                    )}
                    <p className="text-xs truncate" style={{ color: conversation.unread ? "#162040" : "#94a3b8" }}>
                      {conversation.lastMessage?.content ?? "Fără mesaje încă"}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
