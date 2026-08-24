import { serverApiFetch } from "@/lib/api/server";
import { listOngMeetings } from "@/lib/api/meetings";
import type { Ong, MyOng, OngMentor } from "@/lib/api/ongs";
import { listDimensions } from "@/lib/api/dimensions";
import { listActivityTypes } from "@/lib/api/activity-types";
import { PersoaneResursaTabs } from "@/components/features/dashboard-ong/PersoaneResursaTabs";
import { MeetingsFilters } from "@/components/features/organizatii/MeetingsFilters";
import { MeetingsTable } from "@/components/features/organizatii/MeetingsTable";
import { AddMeetingModal } from "@/components/features/organizatii/AddMeetingModal";

type QueryValue = string | string[] | undefined;

interface PageProps {
  searchParams: Promise<{ mentor?: QueryValue; program?: QueryValue; status?: QueryValue; format?: QueryValue }>;
}

function firstQueryValue(value: QueryValue): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function OngPersoaneResursaIntalniriPage({ searchParams }: PageProps) {
  const searchParamsResolved = await searchParams;
  const mentorFilter = firstQueryValue(searchParamsResolved.mentor);
  const programFilter = firstQueryValue(searchParamsResolved.program);
  const statusFilter = firstQueryValue(searchParamsResolved.status);
  const formatFilter = firstQueryValue(searchParamsResolved.format);

  const { data: myOng } = await serverApiFetch<{ data: MyOng }>("/api/ongs/me");

  const [ongRes, mentorsRes, meetingsRes, dimensions, activityTypesRes] = await Promise.all([
    serverApiFetch<{ data: Ong }>(`/api/ongs/${myOng.documentId}`),
    serverApiFetch<{ data: OngMentor[] }>(`/api/ongs/${myOng.documentId}/mentors`),
    listOngMeetings(myOng.documentId, {
      mentor: mentorFilter,
      program: programFilter,
      status: statusFilter,
      format: formatFilter,
    }),
    listDimensions(),
    listActivityTypes(),
  ]);

  const ong = ongRes.data;
  const mentors = mentorsRes.data;

  return (
    <div>
      <PersoaneResursaTabs active="intalniri" />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#162040" }}>
          Toate întâlnirile
        </h1>
        <AddMeetingModal
          ongDocumentId={ong.documentId}
          mentors={mentors}
          programs={ong.programs}
          activityTypes={activityTypesRes.data}
          dimensions={dimensions}
        />
      </div>

      <MeetingsFilters
        mentors={mentors}
        programs={ong.programs}
        initialMentor={mentorFilter}
        initialProgram={programFilter}
        initialStatus={statusFilter}
        initialFormat={formatFilter}
      />

      <MeetingsTable
        meetings={meetingsRes.data}
        ongName={ong.name}
        dimensions={dimensions}
        editing={{
          ongDocumentId: ong.documentId,
          mentors,
          programs: ong.programs,
          activityTypes: activityTypesRes.data,
        }}
      />
    </div>
  );
}
