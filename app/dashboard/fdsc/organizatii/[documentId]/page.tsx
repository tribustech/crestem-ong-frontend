import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import type { Ong, OngOverview } from "@/lib/api/ongs";
import { OrgDetailTabs } from "@/components/features/organizatii/OrgDetailTabs";
import { OrgHeaderCard } from "@/components/features/organizatii/OrgHeaderCard";
import { OrgOverviewStats } from "@/components/features/organizatii/OrgOverviewStats";
import { OrgDetailsCard } from "@/components/features/organizatii/OrgDetailsCard";
import { OrgContactCard } from "@/components/features/organizatii/OrgContactCard";
import { OrgLibraryActivityCard } from "@/components/features/organizatii/OrgLibraryActivityCard";
import { OrgCoursesCard } from "@/components/features/organizatii/OrgCoursesCard";

export default async function OrganizatieOverviewPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const [ongRes, overviewRes] = await Promise.all([
    serverApiFetch<{ data: Ong }>(`/api/ongs/${documentId}`),
    serverApiFetch<{ data: OngOverview }>(`/api/ongs/${documentId}/overview`),
  ]);

  const ong = ongRes.data;

  return (
    <div>
      <Link
        href="/dashboard/fdsc/organizatii"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6"
        style={{ color: "#94a3b8" }}
      >
        <ArrowLeft size={14} /> Înapoi la organizații
      </Link>

      <OrgHeaderCard ong={ong} />

      <OrgDetailTabs documentId={documentId} active="overview" />

      <OrgOverviewStats documentId={documentId} overview={overviewRes.data} programs={ong.programs} />

      <div className="mt-6 flex flex-col gap-6">
        <OrgDetailsCard ong={ong} />
        <OrgContactCard ong={ong} />
        <OrgLibraryActivityCard />
        <OrgCoursesCard />
      </div>
    </div>
  );
}
