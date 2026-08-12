import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import type { EvaluationDetail } from "@/lib/api/evaluations";
import { dimensionColor, dimensionPillStyle } from "@/lib/api/dimension-colors";

const MONTHS_RO = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "noi", "dec"];

function formatShortDate(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return `${day} ${MONTHS_RO[month - 1]} ${year}`;
}

function formatPeriod(startIso: string, endIso: string) {
  const [startYear, startMonth, startDay] = startIso.slice(0, 10).split("-").map(Number);
  const [endYear, endMonth, endDay] = endIso.slice(0, 10).split("-").map(Number);
  if (startYear === endYear && startMonth === endMonth) {
    return `${startDay}–${endDay} ${MONTHS_RO[startMonth - 1]} ${startYear}`;
  }
  return `${startDay} ${MONTHS_RO[startMonth - 1]} ${startYear} – ${endDay} ${MONTHS_RO[endMonth - 1]} ${endYear}`;
}

function formatIndependentPeriod(createdAt: string, finished: boolean, finishedAt: string | null) {
  const end = finished && finishedAt ? formatShortDate(finishedAt) : "prezent";
  return `${formatShortDate(createdAt)} – ${end}`;
}

export function EvaluationResults({ evaluation, backHref }: { evaluation: EvaluationDetail; backHref: string }) {
  const phase = evaluation.report?.phases[0] ?? null;
  const programName = phase?.program?.name ?? null;
  const blockByKey = new Map(evaluation.dimensions.map((block) => [block.dimensionKey, block]));

  return (
    <div>
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium mb-6" style={{ color: "#94a3b8" }}>
        <ArrowLeft size={14} /> Înapoi la evaluările mele
      </Link>

      <h1 className="text-3xl font-heading font-extrabold mb-1" style={{ color: "#162040" }}>
        {evaluation.report?.name ?? "Evaluare"}
      </h1>
      {programName && (
        <p className="text-sm font-semibold mb-6" style={{ color: "#2dbe8f" }}>
          Program: {programName}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs mb-2 text-muted-foreground">Perioadă</p>
          <p className="text-3xl font-extrabold font-heading" style={{ color: "#162040" }}>
            {phase
              ? formatPeriod(phase.startDate, phase.endDate)
              : evaluation.report
                ? formatIndependentPeriod(
                    evaluation.report.createdAt,
                    evaluation.report.finished,
                    evaluation.report.finishedAt,
                  )
                : "Evaluare independentă"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs mb-2 text-muted-foreground">Completat la</p>
          <p className="text-3xl font-extrabold font-heading" style={{ color: "#162040" }}>
            {evaluation.completedAt ? formatShortDate(evaluation.completedAt) : "—"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs mb-2 text-muted-foreground">Scorul meu</p>
          <p className="text-3xl font-extrabold font-heading" style={{ color: "#162040" }}>
            {evaluation.scores.overall != null ? `${evaluation.scores.overall}%` : "—"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="font-bold text-base mb-5" style={{ color: "#162040" }}>
          Răspunsurile mele pe dimensiuni
        </h2>
        <div className="space-y-0">
          {evaluation.progress.completedDimensions.map((dimensionKey) => {
            const block = blockByKey.get(dimensionKey);
            if (!block) return null;
            const score = evaluation.scores.dimensions[dimensionKey] ?? null;
            const color = dimensionColor(score);
            const tags = Array.from(new Set(block.quiz.map((q) => q.tag).filter((tag): tag is string => !!tag)));
            return (
              <div key={dimensionKey} className="py-4 border-b border-border last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 size={18} className="flex-shrink-0" style={{ color: "#2dbe8f" }} />
                  <span className="flex-1 text-base font-semibold" style={{ color: "#162040" }}>
                    {block.name}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-28 h-2 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                      <div className="h-full rounded-full" style={{ width: `${score ?? 0}%`, background: color }} />
                    </div>
                    <span className="text-base font-bold w-12 text-right" style={{ color }}>
                      {score != null ? `${score}%` : "—"}
                    </span>
                  </div>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 ml-7">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={dimensionPillStyle(score)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
