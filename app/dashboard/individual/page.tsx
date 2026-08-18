import { getCurrentUser } from "@/lib/api/session-server";
import { userDisplayName } from "@/lib/api/auth";
import { IndividualProfileSection } from "@/components/features/dashboard-individual/IndividualProfileSection";

export default async function IndividualProfilePage() {
  const user = await getCurrentUser();

  return <IndividualProfileSection nume={userDisplayName(user!)} email={user!.email} createdAt={user!.createdAt} />;
}
