import { AuthPageHeader } from "@/components/features/auth/AuthPageHeader";
import { LoginForm } from "@/components/features/auth/LoginForm";

export const metadata = {
  title: "Autentificare - Crestem ONG",
};

export default function AutentificarePage() {
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
