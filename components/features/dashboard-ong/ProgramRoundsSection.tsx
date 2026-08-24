"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Calendar, Play, Users, ExternalLink, FileText } from "lucide-react";
import { StartEvaluationModal } from "./StartEvaluationModal";
import { findActiveReport } from "@/lib/api/reports";
import type { ProgramRound, RoundPhase, RoundSummary, OngMember } from "@/lib/api/reports";
import type { AssignedMentor } from "@/lib/api/programs";

export interface ProgramRoundWithDetail extends ProgramRound {
  mentors: AssignedMentor[];
  phases: (RoundPhase & { score: number | null })[];
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

const RO_SHORT_MONTHS = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "nov", "dec"];

/** "2025-01-15" → "15 ian 2025" — the long-form date used by the phase timeline. */
function formatDateLong(iso: string) {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  const monthLabel = RO_SHORT_MONTHS[Number(month) - 1] ?? month;
  return `${Number(day)} ${monthLabel} ${year}`;
}

// Phase accents cycle so consecutive phases stay visually distinct.
const PHASE_ACCENTS = [
  { solid: "#2563eb", bg: "#eff6ff", color: "#2563eb" },
  { solid: "#16a34a", bg: "#f0fdf4", color: "#16a34a" },
  { solid: "#9333ea", bg: "#faf5ff", color: "#9333ea" },
];

function StatusBadge({ status }: { status: "Viitor" | "Activ" | "Finalizat" | "În desfășurare" | "Neînceput" }) {
  const map: Record<string, { bg: string; color: string }> = {
    Viitor: { bg: "#fffbeb", color: "#92400e" },
    Activ: { bg: "#eff6ff", color: "#2563eb" },
    Finalizat: { bg: "#f0fdf4", color: "#16a34a" },
    "În desfășurare": { bg: "#eff6ff", color: "#2563eb" },
    Neînceput: { bg: "#f8fafc", color: "#94a3b8" },
  };
  const cfg = map[status] ?? map.Neînceput;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
      {status}
    </span>
  );
}

const PROGRAM_STATUS_LABELS: Record<ProgramRound["program"]["programStatus"], "Viitor" | "Activ" | "Finalizat"> = {
  Upcoming: "Viitor",
  Active: "Activ",
  Finished: "Finalizat",
};

function phaseStatus(phase: RoundPhase): "Activ" | "Finalizat" | "În desfășurare" | "Neînceput" {
  if (!phase.report) return "Neînceput";
  return phase.report.finished ? "Finalizat" : "În desfășurare";
}

export function ProgramRoundsSection({
  programRounds,
  standaloneReports,
  ongMembers,
}: {
  programRounds: ProgramRoundWithDetail[];
  standaloneReports: RoundSummary[];
  ongMembers: OngMember[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [startingProgramId, setStartingProgramId] = useState<string | null>(null);

  if (programRounds.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">Organizația ta nu este înscrisă în niciun program activ momentan.</p>
      </div>
    );
  }

  // BR-19: the ONG can have at most one active evaluation at a time, so an
  // eligible phase can only be started if no OTHER report is already active.
  const activeReport = findActiveReport(programRounds, standaloneReports);

  return (
    <div className="space-y-2">
      {programRounds.map(({ program, phases, mentors }) => {
        const isExpanded = expanded === program.documentId;
        const evaluationPhases = phases.filter((phase) => phase.hasEvaluation);
        const startablePhase = evaluationPhases.find((phase) => phase.active && !phase.report);
        const blockedByOtherActive = !!startablePhase && !!activeReport;

        return (
          <div key={program.documentId} className="bg-white rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-sm">
            <div className="px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="font-semibold text-sm font-heading" style={{ color: "#162040" }}>{program.name}</span>
                  <StatusBadge status={PROGRAM_STATUS_LABELS[program.programStatus]} />
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: "#94a3b8" }}>
                    <Calendar size={12} /> {formatDate(program.startDate)} – {formatDate(program.endDate)}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: "#94a3b8" }}>
                    <Building2 size={12} /> {program.ongsCount} {program.ongsCount === 1 ? "ONG" : "ONG-uri"}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: "#94a3b8" }}>
                    <Users size={12} /> {mentors.length} {mentors.length === 1 ? "persoană resursă" : "persoane resursă"}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                {startablePhase && (
                  <button
                    type="button"
                    disabled={blockedByOtherActive}
                    onClick={() => setStartingProgramId(program.documentId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:opacity-90"
                    style={{ background: "#2dbe8f" }}
                    title={blockedByOtherActive ? "Ai deja o evaluare în desfășurare" : undefined}
                  >
                    <Play size={12} /> Începe evaluarea
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => (prev === program.documentId ? null : program.documentId))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                  style={{
                    color: isExpanded ? "#fff" : "#475569",
                    background: isExpanded ? "#162040" : "transparent",
                    borderColor: isExpanded ? "#162040" : "#e2e8f0",
                  }}
                >
                  <ExternalLink size={12} /> {isExpanded ? "Închide" : "Vezi"}
                </button>
              </div>
            </div>

            {blockedByOtherActive && (
              <div className="px-5 pb-4 -mt-2">
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  Ai o evaluare activă în desfășurare —{" "}
                  <Link
                    href={`/dashboard/ong/evaluari/${activeReport!.documentId}`}
                    className="font-semibold hover:underline"
                    style={{ color: "#2dbe8f" }}
                  >
                    vezi evaluarea
                  </Link>
                </p>
              </div>
            )}

            {isExpanded && (
              <div className="border-t border-border px-5 py-6 space-y-6" style={{ background: "#f8fafc" }}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94a3b8" }}>
                    Persoane resursă alocate
                  </p>
                  {mentors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nicio persoană resursă alocată încă.</p>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {mentors.map((mentor) => (
                        <div key={mentor.documentId} className="flex items-center gap-3 bg-white rounded-xl border border-border px-4 py-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: "#162040" }}
                          >
                            {mentor.nume.trim().split(/\s+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold font-heading" style={{ color: "#162040" }}>{mentor.nume}</p>
                            {mentor.mentorJobTitle && (
                              <p className="text-xs" style={{ color: "#2dbe8f" }}>{mentor.mentorJobTitle}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94a3b8" }}>
                    Fazele programului
                  </p>
                  {phases.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Programul nu are faze definite încă.</p>
                  ) : (
                    <div className="bg-white rounded-xl border border-border overflow-hidden">
                      {phases.map((phase, index) => {
                        const accent = PHASE_ACCENTS[index % PHASE_ACCENTS.length];
                        return (
                          <div
                            key={phase.documentId}
                            className="flex items-center gap-4 px-5 py-3 border-b border-border last:border-0"
                          >
                            <span
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: accent.solid }}
                            >
                              {index + 1}
                            </span>
                            <span className="flex-1 min-w-0 text-sm font-medium truncate" style={{ color: "#162040" }}>
                              {phase.title}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs flex-shrink-0" style={{ color: "#94a3b8" }}>
                              <Calendar size={12} /> {formatDateLong(phase.startDate)} — {formatDateLong(phase.endDate)}
                            </span>
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                              style={{ background: accent.bg, color: accent.color }}
                            >
                              Faza {index + 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94a3b8" }}>
                    Evaluări asociate programului
                  </p>
                  <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                          {["Evaluare", "Perioadă", "Scor obținut", "Status", ""].map((h) => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {evaluationPhases.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                              Nu există evaluări asociate acestui program încă.
                            </td>
                          </tr>
                        ) : (
                          evaluationPhases.map((phase) => {
                            const status = phaseStatus(phase);
                            return (
                              <tr key={phase.documentId} className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors">
                                <td className="px-5 py-3 font-medium" style={{ color: "#162040" }}>
                                  {phase.report?.name ?? phase.title}
                                </td>
                                <td className="px-5 py-3" style={{ color: "#64748b" }}>
                                  {formatDate(phase.startDate)} – {formatDate(phase.endDate)}
                                </td>
                                <td className="px-5 py-3 font-bold font-heading" style={{ color: phase.score != null ? "#162040" : "#94a3b8" }}>
                                  {phase.score != null ? `${phase.score}%` : "—"}
                                </td>
                                <td className="px-5 py-3">
                                  <StatusBadge status={status} />
                                </td>
                                <td className="px-5 py-3 text-right">
                                  {phase.report ? (
                                    <Link
                                      href={`/dashboard/ong/evaluari/${phase.report.documentId}`}
                                      className="text-xs font-semibold hover:underline"
                                      style={{ color: "#2dbe8f" }}
                                    >
                                      {status === "Finalizat" ? "Vezi rezultatele →" : "Vezi evaluarea →"}
                                    </Link>
                                  ) : phase.active ? (
                                    <button
                                      type="button"
                                      disabled={!!activeReport}
                                      onClick={() => setStartingProgramId(program.documentId)}
                                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:opacity-90"
                                      style={{ background: "#2dbe8f" }}
                                      title={activeReport ? "Ai deja o evaluare în desfășurare" : undefined}
                                    >
                                      Începe evaluarea
                                    </button>
                                  ) : null}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94a3b8" }}>
                    Rapoarte disponibile (FDSC)
                  </p>
                  <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                          {["Titlu raport", "Tip", "Data", "Mărime", ""].map((h) => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* FDSC report uploads are not implemented yet — empty state only. */}
                        <tr>
                          <td colSpan={5} className="px-5 py-8 text-center">
                            <FileText size={20} className="mx-auto mb-2" style={{ color: "#cbd5e1" }} />
                            <p className="text-sm text-muted-foreground">
                              Nu există rapoarte disponibile pentru acest program încă.
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {startingProgramId && (
        <StartEvaluationModal
          members={ongMembers}
          program={startingProgramId}
          onClose={() => setStartingProgramId(null)}
        />
      )}
    </div>
  );
}
