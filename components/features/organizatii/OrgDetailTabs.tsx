import Link from "next/link";

const DISABLED_TABS = ["Overview", "Comparație"];

export function OrgDetailTabs({
  documentId,
  active,
}: {
  documentId: string;
  active: "info" | "evaluare-curenta";
}) {
  const tabClass = (isActive: boolean) =>
    isActive ? "pb-3 text-sm font-semibold border-b-2" : "pb-3 text-sm font-medium hover:text-slate-700 transition-colors";
  const tabStyle = (isActive: boolean) =>
    isActive ? { color: "#2dbe8f", borderColor: "#2dbe8f" } : { color: "#64748b" };

  return (
    <div className="mb-6 flex items-center gap-6 border-b border-border">
      <span className="pb-3 text-sm font-medium cursor-not-allowed opacity-40" title="Disponibil în curând">
        {DISABLED_TABS[0]}
      </span>
      <Link
        href={`/dashboard/fdsc/organizatii/${documentId}`}
        className={tabClass(active === "info")}
        style={tabStyle(active === "info")}
      >
        Informații organizație
      </Link>
      <Link
        href={`/dashboard/fdsc/organizatii/${documentId}/evaluare-curenta`}
        className={tabClass(active === "evaluare-curenta")}
        style={tabStyle(active === "evaluare-curenta")}
      >
        Evaluare curentă
      </Link>
      <span className="pb-3 text-sm font-medium cursor-not-allowed opacity-40" title="Disponibil în curând">
        {DISABLED_TABS[1]}
      </span>
    </div>
  );
}
