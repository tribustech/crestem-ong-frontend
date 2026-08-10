import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/session-server";
import { DashboardSidebar } from "@/components/features/dashboard/DashboardSidebar";

export default async function MemberDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/autentificare");
  }
  if (user.role?.type !== "ngo-member") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userName={user.nume} userEmail={user.email} variant="member" />
      <main className="flex-1 overflow-y-auto p-8" style={{ background: "#f8fafc" }}>
        {children}
      </main>
    </div>
  );
}
