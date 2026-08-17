"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddOngMemberModal } from "./AddOngMemberModal";

export function OngUtilizatoriHeaderActions() {
  const [adding, setAdding] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        style={{ background: "#2dbe8f" }}
      >
        <Plus size={16} />
        Adaugă utilizator
      </button>
      {adding && <AddOngMemberModal onClose={() => setAdding(false)} />}
    </>
  );
}
