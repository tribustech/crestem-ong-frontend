import { Suspense } from "react";
import { AuthPageHeader } from "@/components/features/auth/AuthPageHeader";
import { ActivateAccountForm } from "@/components/features/auth/ActivateAccountForm";
import { redirectAuthenticatedToDashboard } from "@/lib/api/session-server";

export const metadata = {
  title: "Activează-ți contul - Crestem ONG",
};

export default async function ActivareMembruPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  // An activation link is a valid destination even for a signed-in visitor (the
  // token may belong to another account), so only bounce a bare visit.
  const { token } = await searchParams;
  if (!token) {
    await redirectAuthenticatedToDashboard();
  }

  return (
    <>
      <AuthPageHeader
        eyebrow="Activare cont"
        title="Setează-ți parola"
        subtitle="Ai fost invitat pe platforma Creștem ONG. Alege o parolă pentru a-ți activa contul."
      />
      <section className="py-16 bg-white">
        <div className="max-w-md mx-auto px-6">
          <Suspense fallback={null}>
            <ActivateAccountForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
