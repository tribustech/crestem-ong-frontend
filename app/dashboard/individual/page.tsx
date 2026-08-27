import { getIndividualProfile } from "@/lib/api/individual-profile";
import { IndividualProfileSection } from "@/components/features/dashboard-individual/IndividualProfileSection";

export default async function IndividualProfilePage() {
  const { data: profile } = await getIndividualProfile();

  return <IndividualProfileSection profile={profile} />;
}
