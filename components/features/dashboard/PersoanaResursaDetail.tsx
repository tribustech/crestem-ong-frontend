import { Mail, Calendar, Layers } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import type { AdminUser } from "@/lib/api/users";
import type { Dimension } from "@/lib/api/dimensions";
import { formatShortDate } from "@/lib/utils/date";
import { avatarColorFor } from "@/lib/utils/avatar";
import { dimensionBadgeFor } from "@/lib/utils/dimension-badges";

export function PersoanaResursaDetail({
  mentor,
  dimensions,
}: {
  mentor: AdminUser;
  dimensions: Dimension[];
}) {
  const initials = mentor.nume.trim().slice(0, 2).toUpperCase();
  const dimensionNames = mentor.dimensiuni.map(
    (key) => dimensions.find((d) => d.key === key)?.name ?? key,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-border p-6 text-center">
          {mentor.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getMediaUrl(mentor.avatar.url)}
              alt=""
              className="w-24 h-24 rounded-full object-cover mx-auto"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-semibold text-white mx-auto"
              style={{ background: avatarColorFor(mentor.documentId) }}
            >
              {initials}
            </div>
          )}
          <p className="mt-4 font-semibold text-lg" style={{ color: "#162040" }}>
            {mentor.nume}
          </p>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Persoană resursă
          </p>

          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2.5 text-left">
            <div className="flex items-center gap-2 text-sm" style={{ color: "#475569" }}>
              <Mail size={15} className="shrink-0" style={{ color: "#94a3b8" }} />
              <span className="truncate">{mentor.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: "#475569" }}>
              <Calendar size={15} className="shrink-0" style={{ color: "#94a3b8" }} />
              <span>Adăugat la {formatShortDate(mentor.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <p className="font-semibold" style={{ color: "#162040" }}>
            Programe alocate
          </p>
          {mentor.programs.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2">
              {mentor.programs.map((program) => (
                <div
                  key={program.documentId}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium"
                  style={{ background: "#f8fafc", color: "#162040" }}
                >
                  <Layers size={15} style={{ color: "#9333ea" }} />
                  {program.name}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm" style={{ color: "#94a3b8" }}>
              Nicio alocare de program.
            </p>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="font-semibold" style={{ color: "#162040" }}>
            Biografie
          </p>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "#475569" }}>
            {mentor.bio || "Nicio biografie adăugată."}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <p className="font-semibold" style={{ color: "#162040" }}>
            Arii de expertiză
          </p>
          <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>
            Domeniile generale de competență ale persoanei resursă
          </p>
          {mentor.ariiDeExpertiza.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {mentor.ariiDeExpertiza.map((arie) => (
                <span
                  key={arie}
                  className="px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ background: "#f1f5f9", color: "#475569" }}
                >
                  {arie}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm" style={{ color: "#94a3b8" }}>
              Nicio arie de expertiză adăugată.
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <p className="font-semibold" style={{ color: "#162040" }}>
            Specializare pe dimensiuni
          </p>
          <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>
            Dimensiunile matricei de evaluare organizațională acoperite
          </p>
          {mentor.dimensiuni.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {mentor.dimensiuni.map((key, i) => {
                const badge = dimensionBadgeFor(key);
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
                    style={{ background: badge.bg, color: badge.text }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: badge.dot }}
                    />
                    {dimensionNames[i]}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm" style={{ color: "#94a3b8" }}>
              Nicio dimensiune adăugată.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
