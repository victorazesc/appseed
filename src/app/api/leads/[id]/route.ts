import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { leadUpdateSchema } from "@/lib/validators";
import { requireWorkspaceFromRequest } from "@/lib/guards";
import { WorkspaceRole } from "@prisma/client";
import { activityInclude, serializeActivity } from "@/lib/server/activity";

function extractTaskMeta(activities: Array<{ type: string; status: string; dueAt: Date | null }>) {
  const now = Date.now();
  const overdueTasks = activities.filter(
    (activity) =>
      activity.type === "task" &&
      activity.status === "OPEN" &&
      activity.dueAt &&
      activity.dueAt.getTime() < now,
  );

  const upcomingTask = activities
    .filter(
      (activity) =>
        activity.type === "task" &&
        activity.status === "OPEN" &&
        activity.dueAt &&
        activity.dueAt.getTime() >= now,
    )
    .sort((a, b) => (a.dueAt?.getTime() ?? 0) - (b.dueAt?.getTime() ?? 0))[0];

  return {
    overdueTasksCount: overdueTasks.length,
    hasOverdueTasks: overdueTasks.length > 0,
    nextDueAt: upcomingTask?.dueAt?.toISOString() ?? null,
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { workspace } = await requireWorkspaceFromRequest(request, { minimumRole: WorkspaceRole.VIEWER });

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        stage: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
        pipeline: {
          select: {
            id: true,
            name: true,
            workspaceId: true,
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          include: activityInclude,
        },
      },
    });

    if (!lead || lead.pipeline.workspaceId !== workspace.id) {
      return jsonError("Lead não encontrado", 404);
    }

    const meta = extractTaskMeta(
      lead.activities.map((activity) => ({
        type: activity.type,
        status: activity.status,
        dueAt: activity.dueAt,
      })),
    );
    const serializedActivities = lead.activities.map((activity) => serializeActivity(activity));

    const sanitizedLead = {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      valueCents: lead.valueCents,
      ownerId: lead.ownerId,
      pipelineId: lead.pipelineId,
      stageId: lead.stageId,
      archived: lead.archived,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
      stage: lead.stage
        ? {
            id: lead.stage.id,
            name: lead.stage.name,
            position: lead.stage.position,
          }
        : null,
      pipeline: lead.pipeline
        ? {
            id: lead.pipeline.id,
            name: lead.pipeline.name,
          }
        : null,
      activities: serializedActivities,
    };

    return NextResponse.json({
      lead: {
        ...sanitizedLead,
        ...meta,
      },
    });
  } catch (error) {
    console.error("GET /api/leads/[id]", error);
    return jsonError("Erro interno", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { workspace, membership } = await requireWorkspaceFromRequest(request);
    if (!membership || membership.role === WorkspaceRole.VIEWER) {
      return jsonError("Acesso negado", 403);
    }
    const payload = await request.json();
    const parsed = leadUpdateSchema.safeParse(payload);

    if (!parsed.success) {
      return jsonError("Dados inválidos", 422);
    }

    const { pipelineId, stageId, ...data } = parsed.data;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { pipeline: true },
    });

    if (!lead || lead.pipeline.workspaceId !== workspace.id) {
      return jsonError("Lead não encontrado", 404);
    }

    let finalPipelineId = lead.pipelineId;

    if (pipelineId) {
      const pipeline = await prisma.pipeline.findFirst({
        where: { id: pipelineId, workspaceId: workspace.id },
      });
      if (!pipeline) {
        return jsonError("Pipeline inválido", 404);
      }
      finalPipelineId = pipeline.id;
    }

    let finalStageId = stageId ?? lead.stageId;

    if (stageId) {
      const stage = await prisma.stage.findFirst({
        where: { id: stageId, pipelineId: finalPipelineId },
      });

      if (!stage) {
        return jsonError("Etapa inválida", 404);
      }

      finalStageId = stage.id;
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        ...data,
        pipelineId: finalPipelineId,
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
          where: { type: "task", status: "OPEN", dueAt: { not: null } },
          select: {
            id: true,
            dueAt: true,
            status: true,
          },
        },
        _count: {
          select: {
            activities: true,
          },
        },
      },
    });

    const meta = extractTaskMeta(
      updated.activities.map((activity) => ({
        type: "task",
        status: activity.status,
        dueAt: activity.dueAt,
      })) ?? [],
    );

    const leadResponse = {
      ...updated,
      ...meta,
    } as Record<string, unknown>;

    delete leadResponse.activities;

    return NextResponse.json({
      lead: leadResponse,
    });
  } catch (error) {
    console.error("PATCH /api/leads/[id]", error);
    return jsonError("Erro interno", 500);
  }
}
