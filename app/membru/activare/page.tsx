import { Suspense } from "react";
import { AuthPageHeader } from "@/components/features/auth/AuthPageHeader";
import { ActivateAccountForm } from "@/components/features/auth/ActivateAccountForm";

export const metadata = {
  title: "Activează-ți contul - Crestem ONG",
};

export default function ActivareMembruPage() {
  return (
    <>
      <AuthPageHeader
        eyebrow="Activare cont"
        title="Setează-ți parola"
        subtitle="Ai fost invitat într-o organizație pe platforma Creștem ONG. Alege o parolă pentru a-ți activa contul."
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
