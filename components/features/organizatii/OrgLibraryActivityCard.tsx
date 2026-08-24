import { BookOpen } from "lucide-react";

type ResourceType = "Ghid" | "Template" | "Studiu de caz" | "Video";

interface LibraryActivityRow {
  resourceTitle: string;
  type: ResourceType;
  accessedAt: string;
  totalAccesses: number;
}

const TYPE_STYLES: Record<ResourceType, { background: string; color: string }> = {
  Ghid: { background: "#eff6ff", color: "#2563eb" },
  Template: { background: "#f5f3ff", color: "#7c3aed" },
  "Studiu de caz": { background: "#fff7ed", color: "#c2410c" },
  Video: { background: "#fef2f2", color: "#dc2626" },
};

export function OrgLibraryActivityCard() {
  const rows: LibraryActivityRow[] = [];

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="flex items-center gap-2 text-base font-heading font-extrabold" style={{ color: "#162040" }}>
          <BookOpen size={18} />
          Articole citite din Bibliotecă
        </h2>
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: "#eff6ff", color: "#2563eb" }}
        >
          {rows.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {rows.length > 0 && (
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                <th className="text-left pb-3 pr-4 font-semibold">Titlu resursă</th>
                <th className="text-left pb-3 pr-4 font-semibold">Tip</th>
                <th className="text-left pb-3 pr-4 font-semibold">Accesat la</th>
                <th className="text-left pb-3 font-semibold">Total accesări</th>
              </tr>
            </thead>
          )}
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="py-6 text-center text-sm text-muted-foreground">
                  Nicio activitate înregistrată încă.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={index} className="border-t border-border">
                  <td className="py-3 pr-4" style={{ color: "#334155" }}>
                    {row.resourceTitle}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={TYPE_STYLES[row.type]}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.accessedAt}</td>
                  <td className="py-3 font-semibold" style={{ color: "#162040" }}>
                    {row.totalAccesses}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
