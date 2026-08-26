// components/features/programe/ProgramAssignments.tsx
import type { AssignedOng, AssignedMentor, ProgramPhase } from "@/lib/api/programs";
import type { ActiveOng } from "@/lib/api/ongs";
import type { ActiveMentor } from "@/lib/api/mentors";
import { AssignOngsSection } from "./AssignOngsSection";
import { AssignMentorsSection } from "./AssignMentorsSection";

export function ProgramAssignments({
  programId,
  assignedOngs,
  assignedMentors,
  activeOngs,
  activeMentors,
  phases,
  entryPhase,
  readOnly = false,
}: {
  programId: string;
  assignedOngs: AssignedOng[];
  assignedMentors: AssignedMentor[];
  activeOngs: ActiveOng[];
  activeMentors: ActiveMentor[];
  phases: ProgramPhase[];
  entryPhase: { documentId: string; title: string } | null;
  readOnly?: boolean;
}) {
  const evaluationPhases = phases.filter((phase) => phase.hasEvaluation);

  return (
    <div>
      <AssignOngsSection
        programId={programId}
        assigned={assignedOngs}
        activeOngs={activeOngs}
        evaluationPhases={evaluationPhases}
        entryPhaseId={entryPhase?.documentId ?? null}
        assignedMentors={assignedMentors}
        readOnly={readOnly}
      />
      <AssignMentorsSection
        programId={programId}
        assigned={assignedMentors}
        activeMentors={activeMentors}
        readOnly={readOnly}
      />
    </div>
  );
}
