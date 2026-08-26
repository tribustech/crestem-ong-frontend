import { serverApiFetch } from "@/lib/api/server";
import type { Ong } from "@/lib/api/ongs";
import { OrgDetailChrome } from "@/components/features/organizatii/OrgDetailChrome";

export default async function MentorOrganizatieDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const ongRes = await serverApiFetch<{ data: Ong }>(`/api/ongs/${documentId}`);

  return (
    <OrgDetailChrome ong={ongRes.data} documentId={documentId} role="mentor">
      {children}
    </OrgDetailChrome>
  );
}
