import { ProfileHeaderCard } from "@/components/features/dashboard/ProfileHeaderCard";
import { ProfileActivitySections } from "@/components/features/dashboard/ProfileActivitySections";
import { ProfileActionsMenu } from "@/components/features/dashboard/ProfileActionsMenu";

export function IndividualProfileSection({
  nume,
  email,
  createdAt,
}: {
  nume: string;
  email: string;
  createdAt: string;
}) {
  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#162040" }}>
            Profilul meu
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informațiile contului și activitatea ta pe platformă.
          </p>
        </div>
        <ProfileActionsMenu />
      </div>

      <ProfileHeaderCard nume={nume} email={email} createdAt={createdAt} />

      <ProfileActivitySections />
    </div>
  );
}
