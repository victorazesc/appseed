import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { leadCreateSchema, leadQuerySchema } from "@/lib/validators";
import { getCurrentUser } from "@/lib/auth";

type LeadWithTasks = {
  activities?: Array<{ id: string; dueAt: Date | null }> | null;
  [key: string]: unknown;
};

function mapLeadResponse<T extends LeadWithTasks | null | undefined>(lead: T) {
  if (!lead) return lead;

  const leadWithActivities = lead as LeadWithTasks & Record<string, unknown>;
  const activities = Array.isArray(leadWithActivities.activities)
    ? (leadWithActivities.activities as Array<{ id: string; dueAt: Date | null }>)
    : [];

  const rest = { ...leadWithActivities } as Record<string, unknown>;
  delete rest.activities;

  const now = Date.now();
  const overdueTasks = activities.filter((task) => task.dueAt && task.dueAt.getTime() < now);
  const nextDueTask = activities
    .filter((task) => task.dueAt && task.dueAt.getTime() >= now)
    .sort((a, b) => (a.dueAt?.getTime() ?? 0) - (b.dueAt?.getTime() ?? 0))[0];

  return {
    ...rest,
    overdueTasksCount: overdueTasks.length,
    hasOverdueTasks: overdueTasks.length > 0,
    nextDueAt: nextDueTask?.dueAt?.toISOString() ?? null,
  };
}

async function resolvePipeline(pipelineId?: string) {
  if (pipelineId) {
    return prisma.pipeline.findFirst({
      where: { id: pipelineId, archived: false },
      include: { stages: { orderBy: { position: "asc" } } },
    });
  }

  return prisma.pipeline.findFirst({
    where: { archived: false },
    orderBy: { createdAt: "asc" },
    include: { stages: { orderBy: { position: "asc" } } },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parseResult = leadQuerySchema.safeParse({
    stageId: searchParams.get("stageId") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    ownerId: searchParams.get("ownerId") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parseResult.success) {
    return jsonError("Parâmetros inválidos", 400);
  }

  const { stageId, q, ownerId, limit, pipelineId } = parseResult.data;

  const leads = await prisma.lead.findMany({
    where: {
      archived: false,
      ...(pipelineId ? { pipelineId } : {}),
      ...(stageId ? { stageId } : {}),
      ...(ownerId ? { ownerId } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      stage: {
        select: {
          id: true,
          name: true,
          position: true,
          pipelineId: true,
        },
      },
      pipeline: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      activities: {
        where: { type: "task", dueAt: { not: null } },
        select: {
          id: true,
          dueAt: true,
        },
      },
      _count: {
        select: {
          activities: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
    ...(limit ? { take: limit } : {}),
  });

  return NextResponse.json({ leads: leads.map((lead) => mapLeadResponse(lead)) });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = leadCreateSchema.safeParse(payload);

    if (!parsed.success) {
      return jsonError("Dados inválidos", 422);
    }

    const { pipelineId, stageId, ownerId, valueCents, ...rest } = parsed.data;

    const pipeline = await resolvePipeline(pipelineId);
    if (!pipeline) {
      return jsonError("Pipeline não encontrado", 404);
    }

    let stageIdToUse: string | null = pipeline.stages[0]?.id ?? null;

    if (stageId) {
      const relatedStage = pipeline.stages.find((item) => item.id === stageId);
      if (relatedStage) {
        stageIdToUse = relatedStage.id;
      } else {
        const fetched = await prisma.stage.findFirst({
          where: { id: stageId, pipelineId: pipeline.id },
        });
        stageIdToUse = fetched?.id ?? null;
      }
    }

    if (!stageIdToUse) {
      return jsonError("Etapa não encontrada", 404);
    }

    const user = await getCurrentUser();

    const finalStageId = stageIdToUse as string;

    const lead = await prisma.lead.create({
      data: {
        ...rest,
        valueCents: valueCents ?? null,
        ownerId: ownerId ?? user?.id ?? null,
        pipelineId: pipeline.id,
        stageId: finalStageId,
      },
      include: {
        stage: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
        activities: {
          where: { type: "task", dueAt: { not: null } },
          select: {
            id: true,
            dueAt: true,
          },
        },
        _count: {
          select: { activities: true },
        },
      },
    });

    return NextResponse.json({ lead: mapLeadResponse(lead as LeadWithTasks) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads", error);
    return jsonError("Erro interno", 500);
  }
}
