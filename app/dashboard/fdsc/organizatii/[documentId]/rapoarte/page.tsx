import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import type { Ong, OngFdscReport } from "@/lib/api/ongs";
import { OrgDetailTabs } from "@/components/features/organizatii/OrgDetailTabs";
import { OrgHeaderCard } from "@/components/features/organizatii/OrgHeaderCard";
import { FdscReportsTable } from "@/components/features/organizatii/FdscReportsTable";
import { AddFdscReportModal } from "@/components/features/organizatii/AddFdscReportModal";

export default async function OrganizatieRapoartePage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const [ongRes, reportsRes] = await Promise.all([
    serverApiFetch<{ data: Ong }>(`/api/ongs/${documentId}`),
    serverApiFetch<{ data: OngFdscReport[] }>(`/api/ongs/${documentId}/fdsc-reports`),
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

      <OrgDetailTabs documentId={documentId} active="rapoarte" />

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-heading font-extrabold" style={{ color: "#162040" }}>
            Arhivă rapoarte
          </h2>
          <p className="text-sm text-muted-foreground">
            Toate rapoartele asociate acestei organizații, indiferent de program
          </p>
        </div>
        <AddFdscReportModal ongDocumentId={documentId} programs={ong.programs} />
      </div>

      <FdscReportsTable reports={reportsRes.data} />
    </div>
  );
}
