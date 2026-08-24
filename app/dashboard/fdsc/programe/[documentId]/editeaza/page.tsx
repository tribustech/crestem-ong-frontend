// app/dashboard/fdsc/programe/[documentId]/editeaza/page.tsx
import { redirect } from "next/navigation";
import { serverApiFetch } from "@/lib/api/server";
import type { ProgramDetail } from "@/lib/api/programs";
import { ProgramForm } from "@/components/features/programe/ProgramForm";
import { isProgramFinished } from "@/lib/utils/program-status";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const program = await serverApiFetch<{ data: ProgramDetail }>(`/api/programs/${documentId}`);

  // A finished program is read-only (the backend refuses the update too).
  if (isProgramFinished(program.data)) {
    redirect(`/dashboard/fdsc/programe/${documentId}`);
  }

  return <ProgramForm mode="edit" program={program.data} />;
}
