import { getConversationsAction } from "@/lib/api/conversations-actions";
import { EvaluationDetailTabs } from "@/components/features/dashboard-ong/EvaluationDetailTabs";
import { MessagesPanel } from "@/components/features/dashboard-ong/MessagesPanel";

export default async function OngEvaluariMesajePage() {
  const conversationsRes = await getConversationsAction();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#162040" }}>
          Evaluările mele
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toate rundele de evaluare pornite de organizația ta.
        </p>
      </div>

      <EvaluationDetailTabs active="mesaje" />

      {conversationsRes.error ? (
        <p className="text-sm" style={{ color: "#ef4444" }}>
          {conversationsRes.error}
        </p>
      ) : (
        <MessagesPanel initialConversations={conversationsRes.data ?? []} />
      )}
    </div>
  );
}
