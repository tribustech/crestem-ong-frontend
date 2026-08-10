// app/dashboard/fdsc/programe/page.tsx
import { serverApiFetch } from "@/lib/api/server";
import type { Program } from "@/lib/api/programs";
import { ProgrammeList } from "@/components/features/programe/ProgrammeList";

export default async function ProgrammePage() {
  const { data: programs } = await serverApiFetch<{ data: Program[] }>("/api/programs");
  return <ProgrammeList programs={programs} />;
}
