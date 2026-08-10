// app/dashboard/fdsc/programe/[documentId]/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import type { ProgramDetail, AssignedOng, AssignedMentor, ProgramStats } from "@/lib/api/programs";
import type { ActiveOng } from "@/lib/api/ongs";
import type { ActiveMentor } from "@/lib/api/mentors";
import { ProgramAssignments } from "@/components/features/programe/ProgramAssignments";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const [program, ongsRes, mentorsRes, activeOngsRes, activeMentorsRes, statsRes] = await Promise.all([
    serverApiFetch<{ data: ProgramDetail }>(`/api/programs/${documentId}`),
    serverApiFetch<{ data: { ongs: AssignedOng[] } }>(`/api/programs/${documentId}/ongs`),
    serverApiFetch<{ data: AssignedMentor[] }>(`/api/programs/${documentId}/mentors`),
    serverApiFetch<{ data: ActiveOng[] }>("/api/ongs/active"),
    serverApiFetch<{ data: ActiveMentor[] }>("/api/mentors/active"),
    serverApiFetch<{ data: ProgramStats }>(`/api/programs/${documentId}/stats`),
  ]);

  const programStats = statsRes.data;
  const stats = [
    {
      value: programStats.ongsCount,
      label: programStats.ongsCount === 1 ? "ONG în program" : "ONG-uri în program",
    },
    { value: programStats.inEvaluation, label: "În evaluare" },
    {
      value: programStats.finalizedEvaluation,
      label: programStats.finalizedEvaluation === 1 ? "Evaluare finalizată" : "Evaluări finalizate",
    },
    {
      value: programStats.mentorsCount,
      label: programStats.mentorsCount === 1 ? "Persoană resursă" : "Persoane resursă",
    },
  ];

  return (
    <div>
      <Link
        href="/dashboard/fdsc/programe"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6"
        style={{ color: "#94a3b8" }}
      >
        <ArrowLeft size={14} /> Înapoi la programe
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#162040" }}>
          Gestionează programul
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{program.data.name}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-border p-5 flex flex-col h-full">
            <p className="text-3xl font-extrabold font-heading mb-1" style={{ color: "#162040" }}>
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-auto">{stat.label}</p>
          </div>
        ))}
      </div>

      <ProgramAssignments
        programId={documentId}
        assignedOngs={ongsRes.data.ongs}
        assignedMentors={mentorsRes.data}
        activeOngs={activeOngsRes.data}
        activeMentors={activeMentorsRes.data}
        entryPhaseTitle={program.data.entryPhase?.title ?? null}
      />
    </div>
  );
}
