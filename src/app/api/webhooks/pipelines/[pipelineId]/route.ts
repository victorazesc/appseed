import { handlePipelineWebhookRequest } from "@/app/api/webhooks/pipeline-handler";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pipelineId: string }> },
) {
  const { pipelineId } = await params;
  return handlePipelineWebhookRequest(pipelineId, request);
}
