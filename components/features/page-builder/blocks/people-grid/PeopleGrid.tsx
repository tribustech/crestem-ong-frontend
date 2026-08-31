import { getMediaUrl } from "@/lib/api/client";
import type { Person, PeopleGridData } from "./schema";

const COL_CLASS: Record<PeopleGridData["coloane"], string> = {
  "1": "sm:grid-cols-1 lg:grid-cols-1",
  "2": "sm:grid-cols-2 lg:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

function PersonCard({ person }: { person: Person }) {
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-border">
      {person.imagine ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={getMediaUrl(person.imagine.url)}
          alt={person.imagineAlt || person.nume}
          className="block h-64 w-full object-cover"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold text-[#162040] wrap-break-word">
          {person.nume}
        </h3>

        {person.rol ? (
          <p className="mt-1 text-sm font-semibold text-[#2dbe8f] wrap-break-word">
            {person.rol}
          </p>
        ) : null}

        {person.organizatie ? (
          <p className="mt-0.5 text-sm text-[#64748b] wrap-break-word">
            {person.organizatie}
          </p>
        ) : null}

        {person.descriere ? (
          <p className="mt-3 text-sm leading-relaxed text-[#475569] wrap-break-word line-clamp-4">
            {person.descriere}
          </p>
        ) : null}

        {person.taguri.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            {person.taguri.map((tag, index) => (
              <span
                key={index}
                className="rounded-full px-2.5 py-1 text-xs font-medium wrap-break-word"
                style={{ background: "rgba(45,190,143,0.12)", color: "#2dbe8f" }}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * "People Grid" — a titled section with a responsive grid of authored people
 * cards (image, name, role, organisation, description, tags). Content is
 * hand-entered in the editor. Pure (no hooks, no `"use client"`) so it can
 * render on the public page unchanged.
 */
export function PeopleGrid({ data }: { data: PeopleGridData }) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        {data.titlu ? (
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2
              className="font-heading wrap-break-word"
              style={{
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#162040",
              }}
            >
              {data.titlu}
            </h2>
          </div>
        ) : null}

        {data.persoane.length > 0 ? (
          <div className={`grid grid-cols-1 gap-6 ${COL_CLASS[data.coloane]}`}>
            {data.persoane.map((person, index) => (
              <PersonCard key={index} person={person} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            Nicio persoană de afișat.
          </p>
        )}
      </div>
    </section>
  );
}
