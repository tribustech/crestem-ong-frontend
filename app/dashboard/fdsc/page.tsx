import { getFdscDashboard } from "@/lib/api/dashboard";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { DashboardStatGrid } from "@/components/features/dashboard/DashboardStatGrid";
import { DashboardStatCard } from "@/components/features/dashboard/DashboardStatCard";
import { DashboardEmptyState } from "@/components/features/dashboard/DashboardEmptyState";

export default async function FdscDashboardPage() {
  const { data } = await getFdscDashboard();

  return (
    <div>
      <DashboardHeader
        title="Panou principal"
        subtitle="Bun venit în platforma de administrare FDSC."
      />

      <DashboardStatGrid>
        <DashboardStatCard value={data.ongCount} label="Organizații înregistrate" />
        <DashboardStatCard
          value={data.finishedReportCount}
          label="Evaluări finalizate"
          valueTone="teal"
        />
        <DashboardStatCard
          value={data.activeProgramCount}
          label="Programe active"
          valueTone="blue"
        />
        <DashboardStatCard
          value={data.fdscReportCount}
          label="Rapoarte generate"
          valueTone="violet"
        />
      </DashboardStatGrid>

      <DashboardEmptyState
        title="Activitate recentă va fi disponibilă în curând."
        description="Această secțiune va fi disponibilă în curând."
      />
    </div>
  );
}
