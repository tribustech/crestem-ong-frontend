import Link from "next/link";

export function OrgDetailTabs({
  documentId,
  active,
}: {
  documentId: string;
  active: "overview" | "info" | "evaluare-curenta" | "comparatie" | "rapoarte" | "persoane-resursa";
}) {
  const tabClass = (isActive: boolean) =>
    isActive
      ? "pb-3 text-sm font-semibold border-b-2"
      : "pb-3 text-sm font-medium hover:text-slate-700 transition-colors";
  const tabStyle = (isActive: boolean) =>
    isActive
      ? { color: "#2dbe8f", borderColor: "#2dbe8f" }
      : { color: "#64748b" };

  return (
    <div className="mb-6 flex items-center gap-6 border-b border-border">
      <Link
        href={`/dashboard/fdsc/organizatii/${documentId}`}
        className={tabClass(active === "overview")}
        style={tabStyle(active === "overview")}
      >
        Overview
      </Link>
      <Link
        href={`/dashboard/fdsc/organizatii/${documentId}/evaluari`}
        className={tabClass(active === "info")}
        style={tabStyle(active === "info")}
      >
        Evaluări
      </Link>
      <Link
        href={`/dashboard/fdsc/organizatii/${documentId}/evaluare-curenta`}
        className={tabClass(active === "evaluare-curenta")}
        style={tabStyle(active === "evaluare-curenta")}
      >
        Evaluare curentă
      </Link>
      <Link
        href={`/dashboard/fdsc/organizatii/${documentId}/comparatie`}
        className={tabClass(active === "comparatie")}
        style={tabStyle(active === "comparatie")}
      >
        Comparație
      </Link>
      <Link
        href={`/dashboard/fdsc/organizatii/${documentId}/rapoarte`}
        className={tabClass(active === "rapoarte")}
        style={tabStyle(active === "rapoarte")}
      >
        Rapoarte
      </Link>
      <Link
        href={`/dashboard/fdsc/organizatii/${documentId}/persoane-resursa`}
        className={tabClass(active === "persoane-resursa")}
        style={tabStyle(active === "persoane-resursa")}
      >
        Persoane resursă
      </Link>
    </div>
  );
}
