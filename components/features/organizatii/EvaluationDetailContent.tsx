import { CheckCircle2, Circle } from "lucide-react";
import type { OngEvaluationDetail } from "@/lib/api/ongs";
import type { Dimension } from "@/lib/api/dimensions";
import { dimensionColor, dimensionPillStyle } from "@/lib/api/dimension-colors";

function formatDate(iso: string) {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}.${month}.${year}`;
}

export function EvaluationDetailContent({
  evaluation,
  dimensions,
}: {
  evaluation: OngEvaluationDetail;
  dimensions: Dimension[];
}) {
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

      <div className="bg-white rounded-xl border border-border p-6 mb-8">
        <h2 className="font-bold text-base mb-5" style={{ color: "#162040" }}>
          Dimensiuni evaluate
        </h2>
        <div className="space-y-0">
          {dimensions.map((dimension) => {
            const score = evaluation.scores?.dimensions?.[dimension.key] ?? null;
            const color = dimensionColor(score);
            const tags = Array.from(
              new Set((dimension.quiz ?? []).map((q) => q.tag).filter((tag): tag is string => !!tag)),
            );
            return (
              <div key={dimension.key} className="py-4 border-b border-border last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  {score != null ? (
                    <CheckCircle2 size={16} className="flex-shrink-0" style={{ color: "#2dbe8f" }} />
                  ) : (
                    <Circle size={16} className="flex-shrink-0" style={{ color: "#cbd5e1" }} />
                  )}
                  <span className="flex-1 text-sm font-semibold" style={{ color: "#162040" }}>
                    {dimension.name}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-28 h-2 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                      <div className="h-full rounded-full" style={{ width: `${score ?? 0}%`, background: color }} />
                    </div>
                    <span className="text-sm font-bold w-10 text-right" style={{ color }}>
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
    </>
  );
}
