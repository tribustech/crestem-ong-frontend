import { getCurrentUser } from "@/lib/api/session-server";
import { userDisplayName } from "@/lib/api/auth";
import { ProfileHeaderCard } from "@/components/features/dashboard/ProfileHeaderCard";
import { ProfileActionsMenu } from "@/components/features/dashboard/ProfileActionsMenu";

export default async function MentorProfilePage() {
  const user = await getCurrentUser();

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#162040" }}>
            Profilul meu
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informațiile contului tău pe platformă.
          </p>
        </div>
        <ProfileActionsMenu showAddOng={false} />
      </div>

      <ProfileHeaderCard nume={userDisplayName(user!)} email={user!.email} createdAt={user!.createdAt} />
    </div>
  );
}
