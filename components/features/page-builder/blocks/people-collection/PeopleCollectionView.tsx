import { PERSON_TYPE_LABEL, personInitials } from "./people-catalog";
import type { PeopleCollectionData } from "./schema";

export interface ViewPerson {
  id: string;
  nume: string;
  functie: string;
  tip: "persoana-resursa" | "echipa-fdsc";
  /** Resolved, absolute image URL, or `null` to fall back to initials. */
  avatarUrl: string | null;
}

const COL_CLASS: Record<PeopleCollectionData["coloane"], string> = {
  "1": "sm:grid-cols-1 lg:grid-cols-1",
  "2": "sm:grid-cols-2 lg:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

function PersonCell({
  person,
  showPhoto,
  showType,
}: {
  person: ViewPerson;
  showPhoto: boolean;
  showType: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      {showPhoto ? (
        person.avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={person.avatarUrl}
            alt={person.nume}
            className="block h-20 w-20 rounded-2xl object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-20 w-20 items-center justify-center rounded-2xl text-lg font-semibold"
            style={{ background: "rgba(45,190,143,0.12)", color: "#2dbe8f" }}
          >
            {personInitials(person.nume)}
          </span>
        )
      ) : null}

      <h3
        className={`text-base font-semibold text-[#162040] wrap-break-word ${
          showPhoto ? "mt-4" : ""
        }`}
      >
        {person.nume}
      </h3>

      {person.functie ? (
        <p className="mt-0.5 text-sm text-[#64748b] wrap-break-word">
          {person.functie}
        </p>
      ) : null}

      {showType ? (
        <p
          className="mt-1 text-xs font-semibold uppercase tracking-wide wrap-break-word"
          style={{ color: "#2dbe8f" }}
        >
          {PERSON_TYPE_LABEL[person.tip]}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Pure presentational half of "People Collection" — the heading + responsive
 * grid of people. `PeopleCollection` (the registered renderer) fetches the
 * directory and feeds it `people`; a future public server page can render this
 * directly with server-fetched data.
 */
export function PeopleCollectionView({
  data,
  people,
}: {
  data: PeopleCollectionData;
  people: ViewPerson[];
}) {
  return (
    <section className="relative overflow-hidden">
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

        {people.length > 0 ? (
          <div
            className={`grid grid-cols-1 gap-x-6 gap-y-10 ${COL_CLASS[data.coloane]}`}
          >
            {people.map((person) => (
              <PersonCell
                key={person.id}
                person={person}
                showPhoto={data.afiseazaFotografia}
                showType={data.afiseazaTipul}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            Nicio persoană nu corespunde criteriilor.
          </p>
        )}
      </div>
    </section>
  );
}
