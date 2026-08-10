"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { StartEvaluationModal } from "./StartEvaluationModal";
import type { EvaluationLock, OngMember } from "@/lib/api/reports";

export function StartIndependentEvaluationButton({
  ongMembers,
  lock,
}: {
  ongMembers: OngMember[];
  lock: EvaluationLock | null;
}) {
  const [starting, setStarting] = useState(false);

  return (
    <div className="mb-6 flex flex-col items-start gap-1.5">
      <button
        type="button"
        disabled={!!lock}
        onClick={() => setStarting(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:opacity-90"
        style={{ background: "#2dbe8f" }}
      >
        <Plus size={14} /> Evaluare independentă
      </button>

      {lock?.reason === "active-report" && (
        <p className="text-xs" style={{ color: "#94a3b8" }}>
          Ai deja o evaluare în desfășurare —{" "}
          <Link
            href={`/dashboard/ong/evaluari/${lock.report.documentId}`}
            className="font-semibold hover:underline"
            style={{ color: "#2dbe8f" }}
          >
            vezi evaluarea
          </Link>
        </p>
      )}
      {lock?.reason === "active-phase" && (
        <p className="text-xs" style={{ color: "#94a3b8" }}>
          Ai o fază de evaluare activă în programul {lock.programName}. Pornește evaluarea din pagina programului.
        </p>
      )}

      {starting && <StartEvaluationModal members={ongMembers} onClose={() => setStarting(false)} />}
    </div>
  );
}
