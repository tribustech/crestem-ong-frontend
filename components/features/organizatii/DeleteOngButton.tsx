"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteOngAction } from "@/lib/api/ongs-actions";

export function DeleteOngButton({
  documentId,
  ongName,
}: {
  documentId: string;
  ongName: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteOngAction(documentId);
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
        aria-label={`Șterge organizația ${ongName}`}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <Trash2 size={16} />
      </button>
      <ConfirmDialog
        open={open}
        title="Șterge organizația"
        description={`Ești sigur că vrei să ștergi organizația „${ongName}”? Organizația va fi ascunsă din listă.`}
        confirmLabel="Șterge"
        loading={isPending}
        loadingLabel="Se șterge..."
        error={error}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
