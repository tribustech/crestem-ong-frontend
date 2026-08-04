import { AuthPageHeader } from "@/components/features/auth/AuthPageHeader";
import { RegisterNgoForm } from "@/components/features/auth/RegisterNgoForm";

export const metadata = {
  title: "Înregistrare ONG - Crestem ONG",
};

export default function InregistrareOngPage() {
  return (
    <>
      <AuthPageHeader
        backHref="/inregistrare"
        backLabel="Înapoi la alegerea contului"
        eyebrow="Reprezint un ONG"
        title="Înregistrează-ți organizația"
        subtitle="Completează formularul de mai jos. Te vom contacta în 2–3 zile lucrătoare cu detalii despre sesiunea ta de evaluare."
      />
      <section className="py-16" style={{ background: "#f8faff" }}>
        <div className="max-w-2xl mx-auto px-6">
          <RegisterNgoForm />
        </div>
      </section>
    </>
  );
}
