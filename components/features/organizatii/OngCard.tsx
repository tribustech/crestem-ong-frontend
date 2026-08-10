import type { Ong } from "@/lib/api/ongs";

export function OngCard({ ong }: { ong: Ong }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h3 className="font-semibold mb-1" style={{ color: "#162040" }}>
        {ong.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        {ong.localitate?.nume ?? "—"}, {ong.judet?.nume ?? "—"}
      </p>
      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">CUI</dt>
          <dd style={{ color: "#334155" }}>{ong.cui}</dd>
        </div>
        {ong.adresa && (
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Adresă</dt>
            <dd className="text-right" style={{ color: "#334155" }}>{ong.adresa}</dd>
          </div>
        )}
        {ong.domeniuActivitate && (
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Domeniu</dt>
            <dd className="text-right" style={{ color: "#334155" }}>{ong.domeniuActivitate}</dd>
          </div>
        )}
        {ong.website && (
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Website</dt>
            <dd className="truncate max-w-[60%]" style={{ color: "#334155" }}>{ong.website}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
