"use client";

import { useEffect, useState } from "react";
import { Eye, GripVertical, Plus, X } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { AddBlockModal } from "./AddBlockModal";
import { BlockConfigDrawer } from "./BlockConfigDrawer";
import { BLOCK_REGISTRY } from "./registry";
import { SortableBlock } from "./SortableBlock";
import { SectionCanvas } from "./blocks/section/SectionCanvas";
import type { SectionData } from "./blocks/section/schema";
import type { BlockFieldErrors, BlockInstance } from "./types";

/** Where a newly picked block should land. */
type AddTarget = { sectionId: string } | null;
/** Which existing block the drawer is editing. */
type EditRef = { id: string; sectionId: string | null } | null;

function isSectionData(value: unknown): value is SectionData {
  return (
    !!value &&
    typeof value === "object" &&
    Array.isArray((value as { blocuri?: unknown }).blocuri)
  );
}

/** Deep-clone a block, assigning fresh ids to it and any nested children. */
function cloneInstance(block: {
  id: string;
  type: string;
  data?: unknown;
}): BlockInstance {
  const data = structuredClone(block.data);
  if (block.type === "section" && isSectionData(data)) {
    data.blocuri = data.blocuri.map(cloneInstance);
  }
  return { id: crypto.randomUUID(), type: block.type, data };
}

function moveInArray<T>(items: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function PageBuilder() {
  const [blocks, setBlocks] = useState<BlockInstance[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addTarget, setAddTarget] = useState<AddTarget>(null);
  const [draftType, setDraftType] = useState<string | null>(null);
  const [draftData, setDraftData] = useState<unknown>(null);
  const [draftErrors, setDraftErrors] = useState<BlockFieldErrors>({});
  const [editRef, setEditRef] = useState<EditRef>(null);
  const [preview, setPreview] = useState(false);

  const draftDefinition = draftType ? BLOCK_REGISTRY[draftType] : undefined;
  const isEditing = editRef !== null;

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreview(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

  const closeDraft = () => {
    setDraftType(null);
    setDraftData(null);
    setDraftErrors({});
    setEditRef(null);
    setAddTarget(null);
  };

  /** Replace one section's data via an updater, leaving every other block alone. */
  const updateSection = (
    sectionId: string,
    updater: (data: SectionData) => SectionData,
  ) => {
    setBlocks((current) =>
      current.map((block) =>
        block.id === sectionId && isSectionData(block.data)
          ? { ...block, data: updater(block.data) }
          : block,
      ),
    );
  };

  const openPickerTop = () => {
    setAddTarget(null);
    setPickerOpen(true);
  };

  const openPickerForSection = (sectionId: string) => {
    setAddTarget({ sectionId });
    setPickerOpen(true);
  };

  const handleSelectBlock = (type: string) => {
    const definition = BLOCK_REGISTRY[type];
    setPickerOpen(false);
    if (!definition) return;
    setEditRef(null);
    setDraftType(type);
    setDraftData(structuredClone(definition.defaults));
    setDraftErrors({});
  };

  const handleEditBlock = (id: string, sectionId: string | null) => {
    let instance: { type: string; data?: unknown } | undefined;
    if (sectionId) {
      const section = blocks.find((b) => b.id === sectionId);
      if (section && isSectionData(section.data)) {
        instance = section.data.blocuri.find((c) => c.id === id);
      }
    } else {
      instance = blocks.find((b) => b.id === id);
    }
    if (!instance) return;
    setAddTarget(null);
    setEditRef({ id, sectionId });
    setDraftType(instance.type);
    setDraftData(structuredClone(instance.data));
    setDraftErrors({});
  };

  const handleSubmitDraft = () => {
    if (!draftDefinition || !draftType) return;
    const result = draftDefinition.parse(draftData);
    if (!result.success) {
      setDraftErrors(result.errors);
      return;
    }

    if (editRef) {
      if (editRef.sectionId) {
        updateSection(editRef.sectionId, (data) => ({
          ...data,
          blocuri: data.blocuri.map((c) =>
            c.id === editRef.id ? { ...c, data: result.data } : c,
          ),
        }));
      } else {
        setBlocks((current) =>
          current.map((b) =>
            b.id === editRef.id ? { ...b, data: result.data } : b,
          ),
        );
      }
    } else if (addTarget) {
      const child = {
        id: crypto.randomUUID(),
        type: draftType,
        data: result.data,
      };
      updateSection(addTarget.sectionId, (data) => ({
        ...data,
        blocuri: [...data.blocuri, child],
      }));
    } else {
      setBlocks((current) => [
        ...current,
        { id: crypto.randomUUID(), type: draftType, data: result.data },
      ]);
    }
    closeDraft();
  };

  // --- top-level block ops ---
  const duplicateBlock = (id: string) => {
    setBlocks((current) => {
      const index = current.findIndex((b) => b.id === id);
      if (index === -1) return current;
      const next = [...current];
      next.splice(index + 1, 0, cloneInstance(current[index]));
      return next;
    });
  };
  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks((current) => {
      const index = current.findIndex((b) => b.id === id);
      return index === -1 ? current : moveInArray(current, index, dir);
    });
  };
  const deleteBlock = (id: string) => {
    setBlocks((current) => current.filter((b) => b.id !== id));
  };

  // --- section child ops ---
  const duplicateChild = (sectionId: string, childId: string) => {
    updateSection(sectionId, (data) => {
      const index = data.blocuri.findIndex((c) => c.id === childId);
      if (index === -1) return data;
      const blocuri = [...data.blocuri];
      blocuri.splice(index + 1, 0, cloneInstance(data.blocuri[index]));
      return { ...data, blocuri };
    });
  };
  const moveChild = (sectionId: string, childId: string, dir: -1 | 1) => {
    updateSection(sectionId, (data) => {
      const index = data.blocuri.findIndex((c) => c.id === childId);
      return index === -1
        ? data
        : { ...data, blocuri: moveInArray(data.blocuri, index, dir) };
    });
  };
  const deleteChild = (sectionId: string, childId: string) => {
    updateSection(sectionId, (data) => ({
      ...data,
      blocuri: data.blocuri.filter((c) => c.id !== childId),
    }));
  };
  const reorderChildren = (sectionId: string, from: number, to: number) => {
    updateSection(sectionId, (data) => ({
      ...data,
      blocuri: arrayMove(data.blocuri, from, to),
    }));
  };

  // --- drag-and-drop (reorder within a list) ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const handleTopDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBlocks((current) => {
      const from = current.findIndex((b) => b.id === active.id);
      const to = current.findIndex((b) => b.id === over.id);
      return from === -1 || to === -1
        ? current
        : arrayMove(current, from, to);
    });
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
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setPreview(true)}
            disabled={blocks.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <Eye size={16} />
            Previzualizează
          </button>
          <button
            type="button"
            onClick={openPickerTop}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#2dbe8f" }}
          >
            <Plus size={16} />
            Adaugă bloc
          </button>
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border px-6 py-20 text-center">
          <p className="text-sm text-muted-foreground">
            Nicio secțiune adăugată. Apasă «Adaugă bloc» pentru a începe.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleTopDragEnd}
        >
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {blocks.map((block, index) => {
                const definition = BLOCK_REGISTRY[block.type];
                if (!definition) return null;

                if (block.type === "section" && isSectionData(block.data)) {
                  const sectionData = block.data;
                  return (
                    <SortableBlock key={block.id} id={block.id}>
                      {(dragHandle) => (
                        <SectionCanvas
                          data={sectionData}
                          dragHandle={dragHandle}
                          actions={{
                            onEdit: () => handleEditBlock(block.id, null),
                            onDuplicate: () => duplicateBlock(block.id),
                            onMove: (dir) => moveBlock(block.id, dir),
                            onDelete: () => deleteBlock(block.id),
                            canMoveUp: index > 0,
                            canMoveDown: index < blocks.length - 1,
                            onAddChild: () => openPickerForSection(block.id),
                            onEditChild: (childId) =>
                              handleEditBlock(childId, block.id),
                            onDuplicateChild: (childId) =>
                              duplicateChild(block.id, childId),
                            onMoveChild: (childId, dir) =>
                              moveChild(block.id, childId, dir),
                            onReorderChildren: (from, to) =>
                              reorderChildren(block.id, from, to),
                            onDeleteChild: (childId) =>
                              deleteChild(block.id, childId),
                          }}
                        />
                      )}
                    </SortableBlock>
                  );
                }

                const { Renderer } = definition;
                return (
                  <SortableBlock key={block.id} id={block.id}>
                    {({ setActivatorNodeRef, attributes, listeners }) => (
                      <div className="group relative">
                        <button
                          type="button"
                          ref={setActivatorNodeRef}
                          {...attributes}
                          {...(listeners ?? {})}
                          aria-label="Trage pentru reordonare"
                          className="absolute left-1 top-1 z-10 cursor-grab touch-none rounded-md bg-white/90 p-1 text-[#94a3b8] opacity-0 shadow-sm transition-opacity hover:text-[#64748b] group-hover:opacity-100"
                        >
                          <GripVertical size={16} aria-hidden="true" />
                        </button>
                        <div
                          className={
                            definition.bare
                              ? undefined
                              : "overflow-hidden rounded-2xl border border-border bg-white"
                          }
                        >
                          <Renderer data={block.data} />
                        </div>
                      </div>
                    )}
                  </SortableBlock>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {pickerOpen && (
        <AddBlockModal
          onSelect={handleSelectBlock}
          onClose={() => {
            setPickerOpen(false);
            setAddTarget(null);
          }}
          excludeTypes={addTarget ? ["section"] : undefined}
        />
      )}

      {preview && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex flex-col bg-white">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-6 py-3">
              <span className="text-sm font-semibold text-[#162040]">
                Previzualizare
              </span>
              <button
                type="button"
                onClick={() => setPreview(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50"
              >
                <X size={16} />
                Închide
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {blocks.map((block) => {
                const definition = BLOCK_REGISTRY[block.type];
                if (!definition) return null;
                const { Renderer } = definition;
                return <Renderer key={block.id} data={block.data} />;
              })}
            </div>
          </div>
        </ModalPortal>
      )}

      {draftDefinition && (
        <BlockConfigDrawer
          definition={draftDefinition}
          draft={draftData}
          errors={draftErrors}
          submitLabel={isEditing ? "Salvează" : "Adaugă blocul"}
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
