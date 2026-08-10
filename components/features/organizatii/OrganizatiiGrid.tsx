"use client";

import { useMemo, useState } from "react";
import type { Ong } from "@/lib/api/ongs";
import { OngCard } from "./OngCard";

export function OrganizatiiGrid({ ongs }: { ongs: Ong[] }) {
  const [search, setSearch] = useState("");
  const [judetFilter, setJudetFilter] = useState("");

  const judete = useMemo(() => {
    const unique = new Map<string, string>();
    for (const ong of ongs) {
      if (ong.judet) unique.set(ong.judet.documentId, ong.judet.nume);
    }
    return [...unique.entries()].sort((a, b) => a[1].localeCompare(b[1], "ro"));
  }, [ongs]);

  const filtered = useMemo(
    () =>
      ongs.filter((ong) => {
        const matchesSearch = ong.name.toLowerCase().includes(search.toLowerCase());
        const matchesJudet = !judetFilter || ong.judet?.documentId === judetFilter;
        return matchesSearch && matchesJudet;
      }),
    [ongs, search, judetFilter],
  );

  return (
    <div>
      <h1 className="text-2xl font-heading font-extrabold mb-6" style={{ color: "#162040" }}>
        Organizații
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          placeholder="Caută după nume..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3.5 py-2.5 rounded-lg border border-border text-sm"
        />
        <select
          value={judetFilter}
          onChange={(e) => setJudetFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-lg border border-border text-sm bg-white"
        >
          <option value="">Toate județele</option>
          {judete.map(([documentId, nume]) => (
            <option key={documentId} value={documentId}>{nume}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nicio organizație găsită.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ong) => (
            <OngCard key={ong.documentId} ong={ong} />
          ))}
        </div>
      )}
    </div>
  );
}
