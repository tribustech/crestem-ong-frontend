"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, KeyRound, Mail, Plus, Trash2 } from "lucide-react";
import { AddOngRequestModal } from "./AddOngRequestModal";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { ChangeEmailModal } from "./ChangeEmailModal";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { DeleteOwnOngDialog } from "../organizatii/DeleteOwnOngDialog";

export function ProfileActionsMenu({
  showAddOng = true,
  showChangeEmail = true,
  deleteOng,
}: {
  showAddOng?: boolean;
  /**
   * Off for the Admin ONG, whose role is deliberately not granted
   * `api::auth.auth.requestEmailChange` — offering the item would only 403.
   */
  showChangeEmail?: boolean;
  /**
   * The Admin ONG's own organization. Present only on the ONG profile, where
   * "Business rules.txt" puts `Șterge ONG` in this menu. The backend still
   * refuses any organization the caller does not belong to.
   */
  deleteOng?: { documentId: string; name: string };
} = {}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingOng, setDeletingOng] = useState(false);
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
          {showAddOng && (
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
          )}
          {showAddOng && <div className="my-1.5 border-t border-border" />}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setChangingPassword(true);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors"
            style={{ color: "#162040" }}
          >
            <KeyRound size={16} style={{ color: "#2dbe8f" }} />
            Schimbă parola
          </button>
          {showChangeEmail && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setChangingEmail(true);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors"
              style={{ color: "#162040" }}
            >
              <Mail size={16} style={{ color: "#2dbe8f" }} />
              Schimbă adresa de mail
            </button>
          )}
          <div className="my-1.5 border-t border-border" />
          {/* Above "Șterge contul" on purpose: BR-32 refuses to delete an
              ngo-admin's account until the organization is gone, so this is the
              step they have to take first. */}
          {deleteOng && (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  setDeletingOng(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors text-[#dc2626]"
              >
                <Trash2 size={16} />
                Șterge ONG
              </button>
              <div className="my-1.5 border-t border-border" />
            </>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setDeleting(true);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors text-[#dc2626]"
          >
            <Trash2 size={16} />
            Șterge contul
          </button>
        </div>
      )}

      {showAddOng && adding && <AddOngRequestModal onClose={() => setAdding(false)} />}
      {changingPassword && <ChangePasswordModal onClose={() => setChangingPassword(false)} />}
      {showChangeEmail && changingEmail && (
        <ChangeEmailModal onClose={() => setChangingEmail(false)} />
      )}
      {/* Mounted outside the dropdown so closing the menu does not unmount the
          dialog mid-deletion. */}
      {deleteOng && deletingOng && (
        <DeleteOwnOngDialog
          documentId={deleteOng.documentId}
          ongName={deleteOng.name}
          onClose={() => setDeletingOng(false)}
        />
      )}
      {deleting && <DeleteAccountModal onClose={() => setDeleting(false)} />}
    </div>
  );
}
