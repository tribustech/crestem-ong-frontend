"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Loader2, Search, X } from "lucide-react";
import { requestJoinOngAction, searchJoinableOngsAction } from "@/lib/api/membership-actions";
import type { JoinableOng } from "@/lib/api/membership";

export function AddOngRequestModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JoinableOng[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isSearchPending, startSearchTransition] = useTransition();
  const [isSendPending, startSendTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startSearchTransition(async () => {
        const result = await searchJoinableOngsAction(query);
        if (result.error) {
          setSearchError(result.error);
          setResults([]);
        } else {
          setSearchError(null);
          setResults(result.data ?? []);
        }
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, startSearchTransition]);

  const handleSendRequest = (ong: JoinableOng) => {
    setPendingId(ong.documentId);
    startSendTransition(async () => {
      const result = await requestJoinOngAction(ong.documentId);
      setPendingId(null);
      if (result.error) {
        setSearchError(result.error);
        return;
      }
      setSentIds((prev) => new Set(prev).add(ong.documentId));
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-ong-request-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <div>
            <h2 id="add-ong-request-title" className="font-heading font-extrabold text-lg" style={{ color: "#162040" }}>
              Adaugă ONG
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Caută un ONG activ pe platformă și trimite o cerere de afiliere.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-border">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Caută după nume, domeniu sau oraș..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors bg-white text-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="px-6 py-4 space-y-3 overflow-y-auto">
          {searchError && (
            <p role="alert" className="rounded-lg px-3 py-2 text-sm bg-[#fff5f5] border-[1.5px] border-[#fca5a5] text-[#ef4444]">
              {searchError}
            </p>
          )}

          {isSearchPending ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Niciun ONG găsit.
            </p>
          ) : (
            results.map((ong) => {
              const sent = sentIds.has(ong.documentId);
              const rowPending = isSendPending && pendingId === ong.documentId;
              return (
                <div
                  key={ong.documentId}
                  className="flex items-center justify-between gap-3 border border-border rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                      style={{ background: "#162040" }}
                    >
                      {ong.name.trim().charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#162040" }}>
                        {ong.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[ong.domeniu, ong.localitate, `${ong.memberCount} membri`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendRequest(ong)}
                    disabled={sent || rowPending}
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-70"
                    style={{ background: sent ? "#94a3b8" : "#2dbe8f" }}
                  >
                    {rowPending && <Loader2 size={14} className="animate-spin" />}
                    {sent && <Check size={14} />}
                    {sent ? "Cerere trimisă" : rowPending ? "Se trimite..." : "Trimite cerere"}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors text-[#475569]"
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  );
}
