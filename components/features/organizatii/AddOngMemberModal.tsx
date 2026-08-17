"use client";

import { useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { inviteOngMemberAction } from "@/lib/api/ongs-actions";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors bg-white text-sm";

export function AddOngMemberModal({ onClose }: { onClose: () => void }) {
  const [nume, setNume] = useState("");
  const [email, setEmail] = useState("");
  const [rolMembruOng, setRolMembruOng] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await inviteOngMemberAction({
        nume,
        email,
        ...(rolMembruOng.trim() ? { rolMembruOng: rolMembruOng.trim() } : {}),
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-ong-member-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <h2 id="add-ong-member-title" className="font-heading font-extrabold text-lg" style={{ color: "#162040" }}>
            Adaugă utilizator
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          {error && (
            <p role="alert" className="rounded-lg px-3 py-2 text-sm bg-[#fff5f5] border-[1.5px] border-[#fca5a5] text-[#ef4444]">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="member-nume" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Nume complet <span style={{ color: "#2dbe8f" }}>*</span>
            </label>
            <input
              id="member-nume"
              type="text"
              className={inputClass}
              value={nume}
              onChange={(e) => setNume(e.target.value)}
              placeholder="ex. Ion Popescu"
            />
          </div>

          <div>
            <label htmlFor="member-email" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Adresă email <span style={{ color: "#2dbe8f" }}>*</span>
            </label>
            <input
              id="member-email"
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ion.popescu@ong.ro"
            />
          </div>

          <div>
            <label htmlFor="member-rol" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Rol în ONG
            </label>
            <input
              id="member-rol"
              type="text"
              className={inputClass}
              value={rolMembruOng}
              onChange={(e) => setRolMembruOng(e.target.value)}
              placeholder="ex. Coordonator, Voluntar, Manager..."
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Utilizatorul va primi o invitație pe email pentru a se alătura ONG-ului tău.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isPending} className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-50 text-[#475569]">
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !nume.trim() || !email.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-70"
            style={{ background: "#2dbe8f" }}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? "Se adaugă..." : "Adaugă"}
          </button>
        </div>
      </div>
    </div>
  );
}
