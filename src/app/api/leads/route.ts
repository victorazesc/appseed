import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { leadCreateSchema, leadQuerySchema } from "@/lib/validators";
import { getSessionUser } from "@/lib/auth";
import { requireWorkspaceFromRequest } from "@/lib/guards";
import { WorkspaceRole } from "@prisma/client";

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

async function resolvePipeline(workspaceId: string, pipelineId?: string) {
  if (pipelineId) {
    return prisma.pipeline.findFirst({
      where: { id: pipelineId, workspaceId, archived: false },
      include: { stages: { orderBy: { position: "asc" } } },
    });
  }

  return prisma.pipeline.findFirst({
    where: { workspaceId, archived: false },
    orderBy: { createdAt: "asc" },
    include: { stages: { orderBy: { position: "asc" } } },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const { workspace } = await requireWorkspaceFromRequest(request, { minimumRole: WorkspaceRole.VIEWER });

    const parseResult = leadQuerySchema.safeParse({
      stageId: searchParams.get("stageId") ?? undefined,
      q: searchParams.get("q") ?? undefined,
      ownerId: searchParams.get("ownerId") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      pipelineId: searchParams.get("pipelineId") ?? undefined,
    });

    if (!parseResult.success) {
      return jsonError("Parâmetros inválidos", 400);
    }

    const { stageId, q, ownerId, limit, pipelineId } = parseResult.data;

    if (pipelineId) {
      const pipeline = await prisma.pipeline.findFirst({
        where: { id: pipelineId, workspaceId: workspace.id },
      });
      if (!pipeline) {
        return jsonError("Pipeline não encontrado", 404);
      }
    }

    let stageFilter: string | undefined;
    if (stageId) {
      const stage = await prisma.stage.findFirst({
        where: { id: stageId, pipeline: { workspaceId: workspace.id } },
      });
      if (!stage) {
        return jsonError("Etapa não encontrada", 404);
      }
      stageFilter = stage.id;
    }

    const leads = await prisma.lead.findMany({
      where: {
        archived: false,
        pipeline: {
          workspaceId: workspace.id,
          ...(pipelineId ? { id: pipelineId } : {}),
        },
        ...(stageFilter ? { stageId: stageFilter } : {}),
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
  } catch (error) {
    console.error("GET /api/leads", error);
    if (error instanceof Error && error.message === "WORKSPACE_REQUIRED") {
      return jsonError("Workspace não informado", 400);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Acesso negado", 403);
    }
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      return jsonError("Workspace não encontrado", 404);
    }
    return jsonError("Erro interno", 500);
  }
}

export async function POST(request: Request) {
  try {
    const { workspace } = await requireWorkspaceFromRequest(request, { minimumRole: WorkspaceRole.MEMBER });
    const payload = await request.json();
    const parsed = leadCreateSchema.safeParse(payload);

    if (!parsed.success) {
      return jsonError("Dados inválidos", 422);
    }

    const { pipelineId, stageId, ownerId, valueCents, ...rest } = parsed.data;

    const pipeline = await resolvePipeline(workspace.id, pipelineId);
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

    const user = await getSessionUser();

    const lead = await prisma.lead.create({
      data: {
        ...rest,
        valueCents: valueCents ?? null,
        ownerId: ownerId ?? user?.id ?? null,
        pipelineId: pipeline.id,
        stageId: stageIdToUse,
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
    if (error instanceof Error && error.message === "WORKSPACE_REQUIRED") {
      return jsonError("Workspace não informado", 400);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Acesso negado", 403);
    }
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      return jsonError("Workspace não encontrado", 404);
    }
    return jsonError("Erro interno", 500);
  }
}
