"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Dimension } from "@/lib/api/dimensions";
import { MeetingFormModal } from "./MeetingFormModal";

interface MentorOption {
  documentId: string;
  nume: string;
}

interface ProgramOption {
  documentId: string;
  name: string;
}

interface ActivityTypeOption {
  documentId: string;
  name: string;
}

export function AddMeetingModal({
  ongDocumentId,
  mentors,
  programs,
  activityTypes,
  dimensions,
}: {
  ongDocumentId: string;
  mentors: MentorOption[];
  programs: ProgramOption[];
  activityTypes: ActivityTypeOption[];
  dimensions: Dimension[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: "#162040" }}
      >
        <Plus size={14} /> Adaugă întâlnire
      </button>

      <MeetingFormModal
        open={open}
        onClose={() => setOpen(false)}
        ongDocumentId={ongDocumentId}
        mentors={mentors}
        programs={programs}
        activityTypes={activityTypes}
        dimensions={dimensions}
      />
    </>
  );
}
