import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/session-server";
import { DashboardSidebar } from "@/components/features/dashboard/DashboardSidebar";

export default async function OngDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/autentificare");
  }
  if (user.role?.type !== "ngo-admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userName={user.nume} userEmail={user.email} variant="ong" />
      <main className="flex-1 overflow-y-auto p-8" style={{ background: "#f8fafc" }}>
        {children}
      </main>
    </div>
  );
}
