import { AuthPageHeader } from "@/components/features/auth/AuthPageHeader";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { redirectAuthenticatedToDashboard } from "@/lib/api/session-server";

export const metadata = {
  title: "Autentificare - Crestem ONG",
};

export default async function AutentificarePage() {
  await redirectAuthenticatedToDashboard();

  return (
    <>
      <AuthPageHeader
        eyebrow="Bun venit înapoi"
        title="Autentifică-te în cont"
        subtitle="Introdu datele contului tău pentru a continua."
      />
      <section className="py-16 bg-white">
        <div className="max-w-md mx-auto px-6">
          <LoginForm />
        </div>
      </section>
    </>
  );
}
