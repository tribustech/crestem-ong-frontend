import { getOngDashboard } from "@/lib/api/dashboard";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { DashboardStatGrid } from "@/components/features/dashboard/DashboardStatGrid";
import { DashboardStatCard } from "@/components/features/dashboard/DashboardStatCard";
import { OngMentorsTable } from "@/components/features/dashboard-ong/OngMentorsTable";
import { RecentProgramsCard } from "@/components/features/dashboard-ong/RecentProgramsCard";

const percent = (score: number | null) => (score === null ? "—" : `${score}%`);

export default async function OngDashboardPage() {
  const { data } = await getOngDashboard();

  return (
    <div>
      <DashboardHeader
        title="Panou principal"
        subtitle="Bun venit! Iată o privire de ansamblu asupra activității tale."
      />

      <DashboardStatGrid>
        <DashboardStatCard
          value={data.memberCount}
          label="Membri afiliați ONG"
          caption="utilizatori înregistrați"
        />
        <DashboardStatCard
          value={data.programCount}
          label="Programe participante"
          caption={`${data.activeProgramCount} active`}
          valueTone="blue"
        />
        <DashboardStatCard
          value={data.finishedReportCount}
          label="Evaluări efectuate"
          caption="sesiuni finalizate"
          valueTone="violet"
        />
        <DashboardStatCard
          value={percent(data.lastScore)}
          label="Scor ultima evaluare"
          caption={
            data.averageScore === null
              ? undefined
              : `medie generală: ${data.averageScore}%`
          }
          valueTone="red"
        />
      </DashboardStatGrid>

      <OngMentorsTable mentors={data.mentors} />

      <RecentProgramsCard programs={data.recentPrograms} />
    </div>
  );
}
