import { serverApiFetch } from "@/lib/api/server";
import { listUsers } from "@/lib/api/users";
import { listDimensions } from "@/lib/api/dimensions";
import type { Ong } from "@/lib/api/ongs";
import { UtilizatoriFilters } from "@/components/features/dashboard/UtilizatoriFilters";
import { UtilizatoriTable } from "@/components/features/dashboard/UtilizatoriTable";
import { UtilizatoriPagination } from "@/components/features/dashboard/UtilizatoriPagination";
import { UtilizatoriHeaderActions } from "@/components/features/dashboard/UtilizatoriHeaderActions";

interface PageProps {
  searchParams: Promise<{ search?: string; role?: string; ong?: string; status?: string; page?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search ?? "";
  const role = params.role ?? "";
  const ong = params.ong ?? "";
  const status = params.status ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const [{ data: users, meta }, { data: ongs }, dimensions] = await Promise.all([
    listUsers({ search, role, ong, status, page }),
    serverApiFetch<{ data: Ong[] }>("/api/ongs"),
    listDimensions(),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#162040" }}>
            Managementul utilizatorilor
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestionează conturile și permisiunile utilizatorilor
          </p>
        </div>
        <UtilizatoriHeaderActions dimensions={dimensions} />
      </div>

      <UtilizatoriFilters
        ongs={ongs}
        initialSearch={search}
        initialRole={role}
        initialOng={ong}
        initialStatus={status}
      />

      <UtilizatoriTable users={users} dimensions={dimensions} />

      <UtilizatoriPagination pagination={meta.pagination} search={search} role={role} ong={ong} status={status} />
    </div>
  );
}
