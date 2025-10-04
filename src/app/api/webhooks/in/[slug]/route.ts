import { handlePipelineWebhookRequestBySlug } from "@/app/api/webhooks/pipeline-handler";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return handlePipelineWebhookRequestBySlug(slug, request);
}
