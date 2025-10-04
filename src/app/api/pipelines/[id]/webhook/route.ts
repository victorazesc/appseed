import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { pipelineWebhookUpdateSchema } from "@/lib/validators";

function buildTokenPreview(token?: string | null) {
  if (!token) return null;
  if (token.length <= 4) return "••••";
  return `••••${token.slice(-4)}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const pipeline = await prisma.pipeline.findUnique({
    where: { id },
    include: {
      stages: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!pipeline) {
    return jsonError("Funil não encontrado", 404);
  }

  const defaultStageId = pipeline.webhookDefaultStageId ?? pipeline.stages[0]?.id ?? null;

  return NextResponse.json({
    url: `/api/webhooks/pipelines/${pipeline.id}`,
    slugUrl: pipeline.webhookSlug ? `/api/webhooks/in/${pipeline.webhookSlug}` : null,
    hasToken: Boolean(pipeline.webhookToken),
    token: pipeline.webhookToken ?? null,
    tokenPreview: buildTokenPreview(pipeline.webhookToken),
    defaultStageId,
    stages: pipeline.stages,
    slug: pipeline.webhookSlug ?? null,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const pipeline = await prisma.pipeline.findUnique({
    where: { id },
    include: {
      stages: {
        orderBy: { position: "asc" },
        select: { id: true },
      },
    },
  });

  if (!pipeline) {
    return jsonError("Funil não encontrado", 404);
  }

  const payload = await request.json();
  const parsed = pipelineWebhookUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError(parsed.error.errors[0]?.message ?? "Dados inválidos", 422);
  }

  const { defaultStageId } = parsed.data;

  const stageIds = new Set(pipeline.stages.map((stage) => stage.id));
  let nextStageId: string | null = null;

  if (defaultStageId && stageIds.has(defaultStageId)) {
    nextStageId = defaultStageId;
  } else {
    nextStageId = pipeline.stages[0]?.id ?? null;
  }

  await prisma.pipeline.update({
    where: { id },
    data: { webhookDefaultStageId: nextStageId },
  });

  return NextResponse.json({ defaultStageId: nextStageId });
}
