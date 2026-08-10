// app/dashboard/fdsc/programe/[documentId]/editeaza/page.tsx
import { serverApiFetch } from "@/lib/api/server";
import type { ProgramDetail } from "@/lib/api/programs";
import { ProgramForm } from "@/components/features/programe/ProgramForm";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const program = await serverApiFetch<{ data: ProgramDetail }>(`/api/programs/${documentId}`);

  return <ProgramForm mode="edit" program={program.data} />;
}
