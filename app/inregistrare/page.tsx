import Link from "next/link";
import { AuthPageHeader } from "@/components/features/auth/AuthPageHeader";
import { AccountTypeCards } from "@/components/features/auth/AccountTypeCards";

export const metadata = {
  title: "Înregistrare - Crestem ONG",
};

export default function InregistrarePage() {
  return (
    <>
      <AuthPageHeader
        eyebrow="Bun venit pe Crestem.ONG"
        title="Cum dorești să te înregistrezi?"
        subtitle="Alege tipul de cont potrivit pentru tine. Poți schimba oricând."
      />
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <AccountTypeCards />
          <p className="text-center mt-10 text-sm" style={{ color: "#94a3b8" }}>
            Ai deja un cont?{" "}
            <Link href="/autentificare" className="font-semibold hover:underline" style={{ color: "#162040" }}>
              Autentifică-te
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
