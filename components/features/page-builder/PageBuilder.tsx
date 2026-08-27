"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddBlockModal } from "./AddBlockModal";
import { BlockConfigDrawer } from "./BlockConfigDrawer";
import { BLOCK_REGISTRY } from "./registry";
import type { BlockFieldErrors, BlockInstance } from "./types";

export function PageBuilder() {
  const [blocks, setBlocks] = useState<BlockInstance[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draftType, setDraftType] = useState<string | null>(null);
  const [draftData, setDraftData] = useState<unknown>(null);
  const [draftErrors, setDraftErrors] = useState<BlockFieldErrors>({});

  const draftDefinition = draftType ? BLOCK_REGISTRY[draftType] : undefined;

  const closeDraft = () => {
    setDraftType(null);
    setDraftData(null);
    setDraftErrors({});
  };

  const handleSelectBlock = (type: string) => {
    const definition = BLOCK_REGISTRY[type];
    setPickerOpen(false);
    if (!definition) return;
    setDraftType(type);
    setDraftData(structuredClone(definition.defaults));
    setDraftErrors({});
  };

  const handleSubmitDraft = () => {
    if (!draftDefinition || !draftType) return;
    const result = draftDefinition.parse(draftData);
    if (!result.success) {
      setDraftErrors(result.errors);
      return;
    }
    setBlocks((current) => [
      ...current,
      { id: crypto.randomUUID(), type: draftType, data: result.data },
    ]);
    closeDraft();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-[#162040]">
            Pagini
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Adaugă secțiuni de conținut în pagină.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#2dbe8f" }}
        >
          <Plus size={16} />
          Adaugă bloc
        </button>
      </div>

      {blocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border px-6 py-20 text-center">
          <p className="text-sm text-muted-foreground">
            Nicio secțiune adăugată. Apasă «Adaugă bloc» pentru a începe.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {blocks.map((block) => {
            const definition = BLOCK_REGISTRY[block.type];
            if (!definition) return null;
            const { Renderer } = definition;
            return (
              <div
                key={block.id}
                className="overflow-hidden rounded-2xl border border-border bg-white"
              >
                <Renderer data={block.data} />
              </div>
            );
          })}
        </div>
      )}

      {pickerOpen && (
        <AddBlockModal
          onSelect={handleSelectBlock}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {draftDefinition && (
        <BlockConfigDrawer
          definition={draftDefinition}
          draft={draftData}
          errors={draftErrors}
          onChange={(next) => {
            setDraftData(next);
            setDraftErrors({});
          }}
          onCancel={closeDraft}
          onSubmit={handleSubmitDraft}
        />
      )}
    </div>
  );
}
