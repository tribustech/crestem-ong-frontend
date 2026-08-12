import { getCurrentUser } from "@/lib/api/session-server";
import { IndividualProfileSection } from "@/components/features/dashboard-individual/IndividualProfileSection";

export default async function IndividualProfilePage() {
  const user = await getCurrentUser();

  return <IndividualProfileSection nume={user!.nume} email={user!.email} createdAt={user!.createdAt} />;
}
