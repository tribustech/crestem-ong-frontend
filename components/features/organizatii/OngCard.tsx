import Link from "next/link";
import { Building2, ExternalLink, Globe, MapPin, Users } from "lucide-react";
import type { Ong } from "@/lib/api/ongs";
import { DeleteOngButton } from "./DeleteOngButton";

export function OngCard({ ong }: { ong: Ong }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center"
            style={{ background: "#eff6ff" }}
          >
            <Building2 size={18} style={{ color: "#2563eb" }} />
          </div>
          <h3 className="font-semibold truncate" style={{ color: "#162040" }}>
            {ong.name}
          </h3>
        </div>
        <DeleteOngButton documentId={ong.documentId} ongName={ong.name} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={14} />
          {ong.localitate?.nume ?? "—"}, {ong.judet?.nume ?? "—"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users size={14} />
          {ong.memberCount ?? 0} {(ong.memberCount ?? 0) === 1 ? "membru" : "membri"}
        </span>
        {ong.website && (
          <a
            href={ong.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:underline"
            style={{ color: "#2563eb" }}
          >
            <Globe size={14} />
            {ong.website.replace(/^https?:\/\//, "")}
          </a>
        )}
      </div>

      {(ong.programs ?? []).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(ong.programs ?? []).map((program) => (
            <span
              key={program.documentId}
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: "#f0faf6", color: "#162040" }}
            >
              {program.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground truncate">
          Admin: <span style={{ color: "#334155" }}>{ong.admin?.nume ?? "—"}</span>
        </p>
        <Link
          href={`/dashboard/fdsc/organizatii/${ong.documentId}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-white shrink-0 hover:opacity-90 transition-opacity"
          style={{ background: "#162040" }}
        >
          <ExternalLink size={14} />
          Vezi ONG
        </Link>
      </div>
    </div>
  );
}
