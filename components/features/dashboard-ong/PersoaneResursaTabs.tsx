import Link from "next/link";

const BASE_PATH = "/dashboard/persoane-resursa";

export function PersoaneResursaTabs({ active }: { active: "mesaje" | "intalniri" }) {
  const tabClass = (isActive: boolean) =>
    isActive
      ? "pb-3 text-sm font-semibold border-b-2 border-accent text-accent"
      : "pb-3 text-sm font-medium text-muted-foreground hover:text-slate-700 transition-colors";

  return (
    <nav className="mb-6 flex items-center gap-6 border-b border-border">
      <Link href={BASE_PATH} className={tabClass(active === "mesaje")}>
        Mesaje
      </Link>
      <Link href={`${BASE_PATH}/intalniri`} className={tabClass(active === "intalniri")}>
        Întâlniri
      </Link>
    </nav>
  );
}
