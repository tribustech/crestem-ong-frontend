import { AuthPageHeader } from "@/components/features/auth/AuthPageHeader";
import { RegisterIndividualForm } from "@/components/features/auth/RegisterIndividualForm";

export const metadata = {
  title: "Creează cont de utilizator - Crestem ONG",
};

export default function InregistrareUtilizatorPage() {
  return (
    <>
      <AuthPageHeader
        backHref="/inregistrare"
        backLabel="Înapoi la alegerea contului"
        eyebrow="Cont de utilizator"
        title="Creează-ți contul"
        subtitle="Completează formularul de mai jos pentru a avea acces la resursele și instrumentele Crestem.ONG."
      />
      <section className="py-16" style={{ background: "#f8faff" }}>
        <div className="max-w-2xl mx-auto px-6">
          <RegisterIndividualForm />
        </div>
      </section>
    </>
  );
}
