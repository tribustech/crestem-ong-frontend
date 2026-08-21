import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import { listOngMeetings } from "@/lib/api/meetings";
import type { Ong, OngMentor } from "@/lib/api/ongs";
import { listDimensions } from "@/lib/api/dimensions";
import { OrgDetailTabs } from "@/components/features/organizatii/OrgDetailTabs";
import { OrgHeaderCard } from "@/components/features/organizatii/OrgHeaderCard";
import { MentorCard } from "@/components/features/organizatii/MentorCard";
import { MeetingsFilters } from "@/components/features/organizatii/MeetingsFilters";
import { MeetingsTable } from "@/components/features/organizatii/MeetingsTable";

type QueryValue = string | string[] | undefined;

interface PageProps {
  params: Promise<{ documentId: string }>;
  searchParams: Promise<{ mentor?: QueryValue; program?: QueryValue; status?: QueryValue; format?: QueryValue }>;
}

function firstQueryValue(value: QueryValue): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function OrganizatiePersoaneResursaPage({ params, searchParams }: PageProps) {
  const { documentId } = await params;
  const searchParamsResolved = await searchParams;
  const mentorFilter = firstQueryValue(searchParamsResolved.mentor);
  const programFilter = firstQueryValue(searchParamsResolved.program);
  const statusFilter = firstQueryValue(searchParamsResolved.status);
  const formatFilter = firstQueryValue(searchParamsResolved.format);

  const [ongRes, mentorsRes, meetingsRes, dimensions] = await Promise.all([
    serverApiFetch<{ data: Ong }>(`/api/ongs/${documentId}`),
    serverApiFetch<{ data: OngMentor[] }>(`/api/ongs/${documentId}/mentors`),
    listOngMeetings(documentId, {
      mentor: mentorFilter,
      program: programFilter,
      status: statusFilter,
      format: formatFilter,
    }),
    listDimensions(),
  ]);

  const ong = ongRes.data;
  const mentors = mentorsRes.data;

  return (
    <div>
      <Link
        href="/dashboard/fdsc/organizatii"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6"
        style={{ color: "#94a3b8" }}
      >
        <ArrowLeft size={14} /> Înapoi la organizații
      </Link>

      <OrgHeaderCard ong={ong} />

      <OrgDetailTabs documentId={documentId} active="persoane-resursa" />

      <h2 className="text-2xl font-heading font-extrabold mb-4" style={{ color: "#162040" }}>
        Persoane resursă
      </h2>

      {mentors.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nicio persoană resursă nu este alocată acestei organizații.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {mentors.map((mentor) => (
            <MentorCard key={mentor.documentId} mentor={mentor} />
          ))}
        </div>
      )}

      <h2 className="text-2xl font-heading font-extrabold mb-4" style={{ color: "#162040" }}>
        Toate întâlnirile
      </h2>

      <MeetingsFilters
        mentors={mentors}
        programs={ong.programs}
        initialMentor={mentorFilter}
        initialProgram={programFilter}
        initialStatus={statusFilter}
        initialFormat={formatFilter}
      />

      <MeetingsTable meetings={meetingsRes.data} ongName={ong.name} dimensions={dimensions} />
    </div>
  );
}
