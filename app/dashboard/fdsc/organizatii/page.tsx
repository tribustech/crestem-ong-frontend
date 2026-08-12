import { serverApiFetch } from "@/lib/api/server";
import type { Ong } from "@/lib/api/ongs";
import type { Program } from "@/lib/api/programs";
import { OrganizatiiGrid } from "@/components/features/organizatii/OrganizatiiGrid";

export default async function OrganizatiiPage() {
  const [{ data: ongs }, { data: programs }] = await Promise.all([
    serverApiFetch<{ data: Ong[] }>("/api/ongs"),
    serverApiFetch<{ data: Program[] }>("/api/programs"),
  ]);
  return <OrganizatiiGrid ongs={ongs} programs={programs} />;
}
