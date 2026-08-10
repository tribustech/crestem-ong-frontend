// components/features/programe/ProgramAssignments.tsx
import type { AssignedOng, AssignedMentor } from "@/lib/api/programs";
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
  entryPhaseTitle,
}: {
  programId: string;
  assignedOngs: AssignedOng[];
  assignedMentors: AssignedMentor[];
  activeOngs: ActiveOng[];
  activeMentors: ActiveMentor[];
  entryPhaseTitle: string | null;
}) {
  return (
    <div>
      <AssignOngsSection
        programId={programId}
        assigned={assignedOngs}
        activeOngs={activeOngs}
        entryPhaseTitle={entryPhaseTitle}
      />
      <AssignMentorsSection programId={programId} assigned={assignedMentors} activeMentors={activeMentors} />
    </div>
  );
}
