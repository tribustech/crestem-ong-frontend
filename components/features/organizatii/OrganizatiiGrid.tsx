"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { Ong } from "@/lib/api/ongs";
import { OngCard } from "./OngCard";

interface ProgramOption {
  documentId: string;
  name: string;
}

export function OrganizatiiGrid({ ongs, programs }: { ongs: Ong[]; programs: ProgramOption[] }) {
  const [search, setSearch] = useState("");
  const [judetFilter, setJudetFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");

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
        const matchesProgram =
          !programFilter || (ong.programs ?? []).some((program) => program.documentId === programFilter);
        return matchesSearch && matchesJudet && matchesProgram;
      }),
    [ongs, search, judetFilter, programFilter],
  );

  return (
    <div>
      <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#162040" }}>
        Organizații NGO
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Gestionează organizațiile înregistrate — <span className="font-semibold">{ongs.length} conturi</span> în
        total
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Caută organizații..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-full border border-border text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-full border border-border text-sm bg-white"
          >
            <option value="">Toate programele</option>
            {programs.map((program) => (
              <option key={program.documentId} value={program.documentId}>
                {program.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={judetFilter}
            onChange={(e) => setJudetFilter(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-full border border-border text-sm bg-white"
          >
            <option value="">Toate județele</option>
            {judete.map(([documentId, nume]) => (
              <option key={documentId} value={documentId}>{nume}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nicio organizație găsită.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((ong) => (
            <OngCard key={ong.documentId} ong={ong} />
          ))}
        </div>
      )}
    </div>
  );
}
