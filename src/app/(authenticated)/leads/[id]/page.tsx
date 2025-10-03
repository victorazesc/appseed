import { LeadDetailClient } from "@/components/lead/lead-detail-client";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LeadDetailClient leadId={id} />;
}
