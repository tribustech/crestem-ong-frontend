import { serverApiFetch } from "@/lib/api/server";
import type { Ong } from "@/lib/api/ongs";
import { OrganizatiiGrid } from "@/components/features/organizatii/OrganizatiiGrid";

export default async function OrganizatiiPage() {
  const { data: ongs } = await serverApiFetch<{ data: Ong[] }>("/api/ongs");
  return <OrganizatiiGrid ongs={ongs} />;
}
