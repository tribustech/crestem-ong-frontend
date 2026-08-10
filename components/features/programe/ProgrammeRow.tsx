// components/features/programe/ProgrammeRow.tsx
import Link from "next/link";
import { Calendar, Edit2, Settings } from "lucide-react";
import type { Program } from "@/lib/api/programs";
import { formatDate } from "@/lib/utils/date";
import { DeleteProgramButton } from "./DeleteProgramButton";

const STATUS_LABELS: Record<Program["programStatus"], string> = {
  Upcoming: "Viitor",
  Active: "Activ",
  Finished: "Finalizat",
};

const STATUS_COLORS: Record<Program["programStatus"], { bg: string; color: string }> = {
  Upcoming: { bg: "#fffbeb", color: "#92400e" },
  Active: { bg: "#eff6ff", color: "#2563eb" },
  Finished: { bg: "#f0fdf4", color: "#16a34a" },
};

const PHASE_COLORS = [
  { bg: "#eff6ff", text: "#1d4ed8" },
  { bg: "#f0fdf4", text: "#15803d" },
  { bg: "#fdf4ff", text: "#7e22ce" },
  { bg: "#fff7ed", text: "#c2410c" },
  { bg: "#fefce8", text: "#a16207" },
  { bg: "#f0fdfa", text: "#0f766e" },
];

export function ProgrammeRow({ program }: { program: Program }) {
  const statusStyle = STATUS_COLORS[program.programStatus];

  return (
    <div className="bg-white rounded-xl border border-border px-5 py-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <span className="font-semibold truncate" style={{ color: "#162040" }}>
              {program.name}
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0"
              style={{ background: statusStyle.bg, color: statusStyle.color }}
            >
              {STATUS_LABELS[program.programStatus]}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar size={12} />
            {formatDate(program.startDate)} – {formatDate(program.endDate)}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/dashboard/fdsc/programe/${program.documentId}/editeaza`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-slate-50 transition-colors"
            style={{ color: "#475569" }}
          >
            <Edit2 size={12} /> Editează
          </Link>
          <Link
            href={`/dashboard/fdsc/programe/${program.documentId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "#7c3aed" }}
          >
            <Settings size={12} /> Gestionează
          </Link>
          <DeleteProgramButton documentId={program.documentId} programName={program.name} />
        </div>
      </div>
      {program.phases.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium mr-1 text-muted-foreground">Faze:</span>
          {program.phases.map((phase, idx) => (
            <span
              key={phase.documentId}
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                background: PHASE_COLORS[idx % PHASE_COLORS.length].bg,
                color: PHASE_COLORS[idx % PHASE_COLORS.length].text,
              }}
            >
              {phase.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
