"use client";

import { useState } from "react";
import type { OngEvaluationDetail, OngEvaluationRespondent } from "@/lib/api/ongs";
import type { Dimension } from "@/lib/api/dimensions";
import type { DimensionComment } from "@/lib/api/reports";
import { DimensionsBreakdown } from "@/components/features/evaluari/DimensionsBreakdown";

function formatDate(iso: string) {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}.${month}.${year}`;
}

/**
 * Arguments grouped by dimension, attributed. FDSC staff and mentors are the
 * only readers of this payload, so respondents are named here — unlike the ONG
 * admin's report page, which the API serves unattributed.
 */
function collectComments(
  respondents: OngEvaluationRespondent[],
): Record<string, DimensionComment[]> {
  const byDimension: Record<string, DimensionComment[]> = {};
  for (const respondent of respondents) {
    for (const block of respondent.dimensions ?? []) {
      const text = (block.comment ?? "").trim();
      if (!block.submitted || !text) continue;
      byDimension[block.dimensionKey] ??= [];
      byDimension[block.dimensionKey].push({
        author: respondent.user?.nume ?? null,
        text,
      });
    }
  }
  return byDimension;
}

export function EvaluationDetailContent({
  evaluation,
  dimensions,
}: {
  evaluation: OngEvaluationDetail;
  dimensions: Dimension[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const phase = evaluation.phases?.[0] ?? null;
  const programName = phase?.program?.name ?? "Evaluare independentă";

  const periodDays =
    phase != null
      ? Math.round(
          (new Date(phase.endDate).getTime() - new Date(phase.startDate).getTime()) / 86_400_000,
        ) + 1
      : null;

  const independentPeriod =
    phase == null
      ? `${formatDate(evaluation.createdAt)} - ${evaluation.finished && evaluation.finishedAt ? formatDate(evaluation.finishedAt) : "prezent"}`
      : null;

  const completion =
    evaluation.invitedCount > 0
      ? Math.round((evaluation.completedCount / evaluation.invitedCount) * 100)
      : 0;

  // Only finished respondents can be inspected — a half-filled evaluation has no
  // scores to show.
  const respondents = (evaluation.evaluations ?? []).filter(
    (respondent) => respondent.progress?.complete,
  );
  const selected = respondents.find((respondent) => respondent.documentId === selectedId) ?? null;

  const shownScores = selected ? selected.scores : evaluation.scores;
  const shownComments = collectComments(selected ? [selected] : respondents);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#162040" }}>
          {evaluation.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {programName} · {evaluation.finished ? "Finalizată" : "În desfășurare"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs mb-2 text-muted-foreground">Perioadă de completare</p>
          <p className="text-3xl font-extrabold font-heading" style={{ color: "#162040" }}>
            {periodDays != null ? `${periodDays} ${periodDays === 1 ? "zi" : "zile"}` : independentPeriod}
          </p>
          <p className="text-xs mt-1 text-muted-foreground">
            {phase != null ? `${formatDate(phase.startDate)} – ${formatDate(phase.endDate)}` : "Evaluare independentă"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs mb-2 text-muted-foreground">Total completări</p>
          <p className="text-3xl font-extrabold font-heading" style={{ color: "#162040" }}>
            {evaluation.completedCount}
          </p>
          <p className="text-xs mt-1 text-muted-foreground">din {evaluation.invitedCount} invitați</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs mb-2 text-muted-foreground">Scor total</p>
          <p className="text-3xl font-extrabold font-heading" style={{ color: "#162040" }}>
            {evaluation.scores.overall != null ? `${evaluation.scores.overall}%` : "—"}
          </p>
          <p className="text-xs mt-1 text-muted-foreground">
            {evaluation.scores.overall != null ? "" : "disponibil la finalizare"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base" style={{ color: "#162040" }}>
            Progres completare matrice
          </h2>
          <span className="text-2xl font-extrabold font-heading" style={{ color: "#2dbe8f" }}>
            {completion}%
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: "#e2e8f0" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${completion}%`, background: "linear-gradient(90deg, #2dbe8f, #1a9e77)" }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {evaluation.completedCount} din {evaluation.invitedCount}{" "}
          {evaluation.invitedCount === 1 ? "membru a finalizat" : "membri au finalizat"} evaluarea
        </p>
      </div>

      {respondents.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            aria-pressed={selected == null}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
            style={
              selected == null
                ? { background: "#2dbe8f", color: "#ffffff", borderColor: "#2dbe8f" }
                : { background: "#ffffff", color: "#64748b", borderColor: "#e2e8f0" }
            }
          >
            Rezultat general
          </button>
          {respondents.map((respondent) => {
            const active = respondent.documentId === selectedId;
            return (
              <button
                key={respondent.documentId}
                type="button"
                onClick={() => setSelectedId(respondent.documentId)}
                aria-pressed={active}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                style={
                  active
                    ? { background: "#2dbe8f", color: "#ffffff", borderColor: "#2dbe8f" }
                    : { background: "#ffffff", color: "#64748b", borderColor: "#e2e8f0" }
                }
              >
                {respondent.user?.nume ?? "Membru șters"}
              </button>
            );
          })}
        </div>
      )}

      <DimensionsBreakdown
        dimensions={dimensions}
        scores={shownScores}
        comments={shownComments}
      />
    </>
  );
}
