import type { Ong } from "@/lib/api/ongs";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>
        {label}
      </p>
      <p className="text-sm" style={{ color: "#334155" }}>
        {value}
      </p>
    </div>
  );
}

export function OrgContactCard({ ong }: { ong: Ong }) {
  const admin = ong.admin;
  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h2 className="text-base font-heading font-extrabold mb-5" style={{ color: "#162040" }}>
        Persoană de contact
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
        <Field label="Nume complet" value={admin?.nume ?? "—"} />
        <Field label="Email" value={admin?.email ?? "—"} />
        <Field label="Telefon" value={admin?.telefon ?? "—"} />
        <Field label="Înregistrat la" value={formatDate(admin?.createdAt)} />
        <Field label="Ultima autentificare" value={formatDate(admin?.lastLogin)} />
      </div>
    </div>
  );
}
