import { serverApiFetch } from "@/lib/api/server";
import { getMediaUrl } from "@/lib/api/client";
import type { MyOng } from "@/lib/api/ongs";
import { OngProfileHeaderActions } from "@/components/features/organizatii/OngProfileHeaderActions";

export default async function OngProfilPage() {
  const { data: ong } = await serverApiFetch<{ data: MyOng }>("/api/ongs/me");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#162040" }}>
          Profilul meu
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Informațiile organizației și activitatea ta pe platformă.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            {ong.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getMediaUrl(ong.logo.url)}
                alt={`Logo ${ong.name}`}
                className="w-16 h-16 rounded-xl object-cover border border-border"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center font-heading font-extrabold text-white text-xl"
                style={{ background: "#162040" }}
              >
                {ong.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="font-heading font-extrabold text-xl" style={{ color: "#162040" }}>
                {ong.name}
              </h2>
              <p className="text-sm text-muted-foreground">CUI: {ong.cui}</p>
            </div>
          </div>
          <OngProfileHeaderActions ong={ong} />
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Județ / Localitate
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>
              {ong.judet?.nume ?? "—"}
              {ong.localitate ? `, ${ong.localitate.nume}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Website
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>{ong.website ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Social media
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>{ong.socialMedia ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Domeniu principal
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>{ong.domeniuPrincipal?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Domeniu secundar
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>{ong.domeniuSecundar?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Cuvinte cheie
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>{ong.cuvinteCheie ?? "—"}</dd>
          </div>
        </dl>

        {ong.descriere && (
          <dl className="mt-6 pt-6 border-t border-border">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Descriere
            </dt>
            <dd className="text-sm font-semibold" style={{ color: "#162040" }}>
              {ong.descriere}
            </dd>
          </dl>
        )}
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
          Persoană de contact
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Nume complet
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>
              {ong.contact.nume} {ong.contact.prenume}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Email
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>{ong.contact.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Telefon
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>{ong.contact.telefon}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
