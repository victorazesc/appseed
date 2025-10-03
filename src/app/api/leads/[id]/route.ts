import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { leadUpdateSchema } from "@/lib/validators";

function extractTaskMeta(activities: Array<{ type: string; dueAt: Date | null }>) {
  const now = Date.now();
  const overdueTasks = activities.filter(
    (activity) => activity.type === "task" && activity.dueAt && activity.dueAt.getTime() < now,
  );

  const upcomingTask = activities
    .filter((activity) => activity.type === "task" && activity.dueAt && activity.dueAt.getTime() >= now)
    .sort((a, b) => (a.dueAt?.getTime() ?? 0) - (b.dueAt?.getTime() ?? 0))[0];

  return {
    overdueTasksCount: overdueTasks.length,
    hasOverdueTasks: overdueTasks.length > 0,
    nextDueAt: upcomingTask?.dueAt?.toISOString() ?? null,
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lead) {
      return jsonError("Lead não encontrado", 404);
    }

    const meta = extractTaskMeta(lead.activities);

    return NextResponse.json({
      lead: {
        ...lead,
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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

    if (!lead) {
      return jsonError("Lead não encontrado", 404);
    }

    const finalPipelineId = pipelineId ?? lead.pipelineId;

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
    });

    const meta = extractTaskMeta(
      updated.activities.map((activity) => ({ type: "task", dueAt: activity.dueAt })) ?? [],
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
