"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowLeft, Building2, Plus, Search, Trash2, X } from "lucide-react";
import { assignOngAction, removeOngAction } from "@/lib/api/programs-actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { listOngEvaluations, type OngEvaluation } from "@/lib/api/ongs";
import type { AssignedOng } from "@/lib/api/programs";
import type { ActiveOng } from "@/lib/api/ongs";

function formatEvalPeriod(evaluation: OngEvaluation) {
  const start = new Date(evaluation.createdAt).toLocaleDateString("ro-RO", {
    month: "short",
    year: "numeric",
  });
  if (!evaluation.finishedAt) {
    return `${start} – prezent`;
  }
  const end = new Date(evaluation.finishedAt).toLocaleDateString("ro-RO", {
    month: "short",
    year: "numeric",
  });
  return `${start} – ${end}`;
}

export function AssignOngsSection({
  programId,
  assigned,
  activeOngs,
  entryPhaseTitle,
}: {
  programId: string;
  assigned: AssignedOng[];
  activeOngs: ActiveOng[];
  entryPhaseTitle: string | null;
}) {
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<AssignedOng | null>(null);
  const [isPending, startTransition] = useTransition();

  const [pendingOng, setPendingOng] = useState<ActiveOng | null>(null);
  const [evalSearch, setEvalSearch] = useState("");
  const [selectedEvalId, setSelectedEvalId] = useState<string>("");
  const [evaluations, setEvaluations] = useState<OngEvaluation[]>([]);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  const assignedIds = useMemo(() => new Set(assigned.map((ong) => ong.documentId)), [assigned]);
  const candidates = useMemo(
    () =>
      activeOngs.filter(
        (ong) =>
          !assignedIds.has(ong.documentId) &&
          ong.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [activeOngs, assignedIds, search],
  );

  const filteredEvaluations = useMemo(
    () => evaluations.filter((evaluation) => evaluation.name.toLowerCase().includes(evalSearch.toLowerCase())),
    [evaluations, evalSearch],
  );

  useEffect(() => {
    if (!pendingOng) return;
    let cancelled = false;
    listOngEvaluations(pendingOng.documentId, programId)
      .then((res) => {
        if (!cancelled) setEvaluations(res.data);
      })
      .catch(() => {
        if (!cancelled) setEvalError("Nu am putut încărca evaluările acestei organizații.");
      })
      .finally(() => {
        if (!cancelled) setLoadingEvaluations(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pendingOng, programId]);

  const handleSelectOng = (ong: ActiveOng) => {
    setEvalSearch("");
    setSelectedEvalId("");
    setEvaluations([]);
    setEvalError(null);
    setLoadingEvaluations(true);
    setPendingOng(ong);
  };

  const handleConfirmAdd = (withEval: boolean) => {
    if (!pendingOng) return;
    setError(null);
    startTransition(async () => {
      const result = await assignOngAction(
        programId,
        pendingOng.documentId,
        withEval && selectedEvalId ? selectedEvalId : undefined,
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      setPendingOng(null);
      setSelectedEvalId("");
      setSearch("");
      setAdding(false);
    });
  };

  const handleConfirmRemove = () => {
    if (!pendingRemove) return;
    setRemoveError(null);
    startTransition(async () => {
      const result = await removeOngAction(programId, pendingRemove.documentId);
      if (result.error) {
        setRemoveError(result.error);
        return;
      }
      setPendingRemove(null);
    });
  };

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold font-heading" style={{ fontSize: "1.0625rem", color: "#162040" }}>
            Alocă ONG-uri în acest program
          </h2>
          <p className="text-sm mt-0.5 text-muted-foreground">
            {assigned.length} {assigned.length === 1 ? "ONG alocat" : "ONG-uri alocate"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setAdding((prev) => !prev);
            setSearch("");
            setPendingOng(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shrink-0"
          style={{ background: adding ? "#475569" : "#2563eb" }}
        >
          {adding ? <X size={14} /> : <Plus size={14} />} {adding ? "Închide" : "Adaugă ONG"}
        </button>
      </div>

      {error && (
        <p className="px-6 py-3 text-xs border-b border-border" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}

      {adding && !pendingOng && (
        <div style={{ borderBottom: "1px solid #e2e8f0" }}>
          <div className="px-6 py-3 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
              <input
                autoFocus
                type="text"
                placeholder="Caută ONG-uri..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>
          <div className="divide-y divide-border max-h-64 overflow-y-auto" style={{ background: "#fafafa" }}>
            {candidates.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">
                {search ? "Niciun ONG găsit." : "Toate ONG-urile sunt deja alocate."}
              </p>
            ) : (
              candidates.map((ong) => (
                <button
                  key={ong.documentId}
                  type="button"
                  onClick={() => handleSelectOng(ong)}
                  className="w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-blue-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#e2e8f0" }}>
                    <Building2 size={13} style={{ color: "#94a3b8" }} />
                  </div>
                  <span className="text-sm text-slate-600">{ong.name}</span>
                  <Plus size={13} className="ml-auto flex-shrink-0" style={{ color: "#2563eb" }} />
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {adding && pendingOng && (
        <div style={{ borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPendingOng(null)}
              className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              style={{ color: "#64748b" }}
            >
              <ArrowLeft size={14} />
            </button>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#162040" }}>{pendingOng.name}</p>
              <p className="text-xs text-muted-foreground">
                {entryPhaseTitle
                  ? `Alocă o evaluare pentru faza „${entryPhaseTitle}" (opțional)`
                  : "Alocă o evaluare (opțional)"}
              </p>
            </div>
          </div>

          <div className="px-6 py-3 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Caută evaluări..."
                value={evalSearch}
                onChange={(e) => setEvalSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-accent transition-colors bg-white"
              />
            </div>
          </div>

          <div className="divide-y divide-border max-h-52 overflow-y-auto">
            {loadingEvaluations ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">Se încarcă evaluările...</p>
            ) : evalError ? (
              <p className="px-6 py-4 text-sm" style={{ color: "#ef4444" }}>{evalError}</p>
            ) : filteredEvaluations.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">
                {evaluations.length === 0 ? "Nicio evaluare disponibilă pentru acest ONG." : "Nicio evaluare găsită."}
              </p>
            ) : (
              filteredEvaluations.map((evaluation) => (
                <button
                  key={evaluation.documentId}
                  type="button"
                  onClick={() => setSelectedEvalId(selectedEvalId === evaluation.documentId ? "" : evaluation.documentId)}
                  className="w-full flex items-center gap-3 px-6 py-3 text-left transition-colors"
                  style={{ background: selectedEvalId === evaluation.documentId ? "#eff6ff" : "transparent" }}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      borderColor: selectedEvalId === evaluation.documentId ? "#2563eb" : "#cbd5e1",
                      background: selectedEvalId === evaluation.documentId ? "#2563eb" : "transparent",
                    }}
                  >
                    {selectedEvalId === evaluation.documentId && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "#162040" }}>{evaluation.name}</p>
                    <p className="text-xs text-muted-foreground">{formatEvalPeriod(evaluation)}</p>
                  </div>
                  {!evaluation.finished && (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: "#fef3c7", color: "#d97706" }}
                    >
                      În curs
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="px-6 py-4 flex items-center gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleConfirmAdd(true)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60 inline-flex items-center gap-2"
              style={{ background: "#2563eb" }}
            >
              {isPending && (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
              )}
              {isPending ? "Se adaugă..." : selectedEvalId ? "Adaugă cu evaluarea selectată" : "Adaugă ONG"}
            </button>
            {selectedEvalId && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleConfirmAdd(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-100 transition-colors disabled:opacity-60"
                style={{ color: "#475569" }}
              >
                Adaugă fără evaluare
              </button>
            )}
          </div>
        </div>
      )}

      {assigned.length === 0 && !adding ? (
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">Niciun ONG alocat încă.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {assigned.map((ong) => (
            <div key={ong.documentId} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#eff6ff" }}>
                  <Building2 size={14} style={{ color: "#2563eb" }} />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-medium block truncate" style={{ color: "#162040" }}>{ong.name}</span>
                  {ong.evaluation && (
                    <span
                      className="inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full truncate max-w-full"
                      style={{ background: "#eff6ff", color: "#2563eb" }}
                    >
                      Eval: {ong.evaluation.name}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setRemoveError(null);
                  setPendingRemove(ong);
                }}
                aria-label={`Elimină ${ong.name}`}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60 shrink-0"
                style={{ color: "#94a3b8" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingRemove !== null}
        title="Elimină ONG-ul din program"
        description={`Ești sigur că vrei să elimini organizația „${pendingRemove?.name}” din acest program?`}
        confirmLabel="Elimină"
        loading={isPending}
        loadingLabel="Se elimină..."
        error={removeError}
        onConfirm={handleConfirmRemove}
        onCancel={() => setPendingRemove(null)}
      />
    </div>
  );
}
