import { NextResponse } from "next/server";
import { subHours } from "date-fns";
import { ActivityPriority, ActivityStatus, ActivityType, type Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { pipelineWebhookPayloadSchema } from "@/lib/validators";

type PipelineWithStages = Prisma.PipelineGetPayload<{
  include: {
    stages: true;
  };
}>;

function extractBearerToken(headerValue: string | null) {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer") return null;
  return token?.trim() || null;
}

function normalizeEmail(email?: string | null) {
  return email ? email.toLowerCase() : undefined;
}

function formatMetadataNote(origin?: string, metadata?: Record<string, unknown>) {
  const lines: string[] = [];

  if (origin) {
    lines.push(`Origem: ${origin}`);
  }

  if (metadata && Object.keys(metadata).length > 0) {
    lines.push("Metadata:");
    lines.push(JSON.stringify(metadata, null, 2));
  }

  if (!lines.length) {
    return null;
  }

  lines.unshift("Webhook recebido");

  return lines.join("\n");
}

export async function handlePipelineWebhookRequest(pipelineId: string, request: Request) {
  const pipeline = (await prisma.pipeline.findFirst({
    where: { id: pipelineId, archived: false },
    include: {
      stages: {
        orderBy: { position: "asc" },
      },
    },
  })) as PipelineWithStages | null;

  if (!pipeline) {
    return jsonError("Funil não encontrado", 404);
  }

  return processPipelineWebhookRequest({ pipeline, request });
}

export async function handlePipelineWebhookRequestBySlug(slug: string, request: Request) {
  const pipeline = (await prisma.pipeline.findFirst({
    where: { webhookSlug: slug, archived: false },
    include: {
      stages: {
        orderBy: { position: "asc" },
      },
    },
  })) as PipelineWithStages | null;

  if (!pipeline) {
    return jsonError("Funil não encontrado", 404);
  }

  return processPipelineWebhookRequest({ pipeline, request });
}

type ProcessParams = {
  pipeline: PipelineWithStages;
  request: Request;
};

async function processPipelineWebhookRequest({ pipeline, request }: ProcessParams) {
  const tokenFromHeader = extractBearerToken(
    request.headers.get("authorization") ?? request.headers.get("Authorization"),
  );

  if (!tokenFromHeader || tokenFromHeader !== pipeline.webhookToken) {
    return jsonError("Autenticação inválida", 401);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    console.error("webhook parse", error);
    return jsonError("JSON inválido", 422);
  }

  const parsed = pipelineWebhookPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return jsonError(firstError?.message ?? "Dados inválidos", 422);
  }

  const data = parsed.data;
  const email = normalizeEmail(data.email);
  const valueCents = data.value;
  const stageName = data.stage?.trim().toLowerCase();

  const targetStage = stageName
    ? pipeline.stages.find((stage) => stage.name.toLowerCase() === stageName)
    : undefined;

  let resolvedStage = targetStage;

  if (!resolvedStage && pipeline.webhookDefaultStageId) {
    resolvedStage = pipeline.stages.find((stage) => stage.id === pipeline.webhookDefaultStageId);
  }

  if (!resolvedStage) {
    resolvedStage = pipeline.stages[0];
  }

  if (!resolvedStage) {
    return jsonError("Funil sem etapas", 422);
  }

  const now = new Date();
  const windowStart = subHours(now, 24);

  let duplicateLeadId: string | null = null;

  if (email && data.company) {
    const duplicateLead = await prisma.lead.findFirst({
      where: {
        pipelineId: pipeline.id,
        archived: false,
        email: { equals: email, mode: "insensitive" },
        company: { equals: data.company, mode: "insensitive" },
        createdAt: {
          gte: windowStart,
        },
      },
      select: { id: true },
    });

    duplicateLeadId = duplicateLead?.id ?? null;
  }

  const noteContent = formatMetadataNote(data.origin, data.metadata as Record<string, unknown> | undefined);

  const result = await prisma.$transaction(async (tx) => {
    let lead;
    let status: "created" | "updated" = "created";

    if (duplicateLeadId) {
      lead = await tx.lead.update({
        where: { id: duplicateLeadId },
        data: {
          name: data.name,
          email: email ?? undefined,
          phone: data.phone ?? undefined,
          company: data.company ?? undefined,
          valueCents: valueCents ?? undefined,
          stageId: resolvedStage?.id ?? undefined,
        },
      });
      status = "updated";
    } else {
      lead = await tx.lead.create({
        data: {
          name: data.name,
          email: email ?? null,
          phone: data.phone ?? null,
          company: data.company ?? null,
          valueCents: valueCents ?? null,
          pipelineId: pipeline.id,
          stageId: resolvedStage.id,
          archived: false,
        },
      });
    }

    if (noteContent) {
      await tx.activity.create({
        data: {
          type: ActivityType.note,
          title: noteContent.slice(0, 140),
          content: noteContent,
          leadId: lead.id,
          workspaceId: pipeline.workspaceId,
          status: ActivityStatus.OPEN,
          priority: ActivityPriority.MEDIUM,
        },
      });
    }

    return { lead, status };
  });

  return NextResponse.json(
    {
      leadId: result.lead.id,
      pipelineId: pipeline.id,
      stageId: resolvedStage.id,
      status: result.status,
    },
    { status: result.status === "created" ? 201 : 200 },
  );
}
