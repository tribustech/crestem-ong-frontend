"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { AddOngRequestModal } from "./AddOngRequestModal";

export function ProfileActionsMenu() {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors"
        style={{ color: "#162040" }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Acțiuni
        <ChevronDown size={16} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-border shadow-lg py-1.5 z-10"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setAdding(true);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors"
            style={{ color: "#162040" }}
          >
            <Plus size={16} style={{ color: "#2dbe8f" }} />
            Adaugă ONG
          </button>
        </div>
      )}

      {adding && <AddOngRequestModal onClose={() => setAdding(false)} />}
    </div>
  );
}
