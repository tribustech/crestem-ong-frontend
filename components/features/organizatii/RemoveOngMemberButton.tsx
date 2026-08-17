"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { removeOngMemberAction } from "@/lib/api/ongs-actions";

export function RemoveOngMemberButton({ documentId, nume }: { documentId: string; nume: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await removeOngMemberAction(documentId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-red-50 hover:border-[#fca5a5] transition-colors"
        style={{ color: "#ef4444" }}
      >
        Marchează ca neafiliat
      </button>
      <ConfirmDialog
        open={open}
        title="Elimină utilizatorul"
        description={`Ești sigur că vrei să marchezi „${nume}” ca neafiliat? Contul rămâne activ, dar va pierde accesul la această organizație.`}
        confirmLabel="Marchează ca neafiliat"
        loading={isPending}
        loadingLabel="Se elimină..."
        error={error}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
