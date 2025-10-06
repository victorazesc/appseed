import { NextResponse } from "next/server";
import { differenceInDays, subDays } from "date-fns";
import { WorkspaceRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { leadTransitionSchema } from "@/lib/validators";
import { requireWorkspaceFromRequest } from "@/lib/guards";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { workspace } = await requireWorkspaceFromRequest(request, { minimumRole: WorkspaceRole.MEMBER });
    const { id } = await params;

    const payload = await request.json();
    const parsed = leadTransitionSchema.safeParse(payload);

    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Dados inválidos", 422);
    }

    const { targetPipelineId, targetStageId, copyActivities, archiveSource } = parsed.data;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        pipeline: true,
        activities: {
          where: {
            createdAt: {
              gte: subDays(new Date(), 90),
            },
          },
        },
      },
    });

    if (!lead || lead.archived || lead.pipeline.workspaceId !== workspace.id) {
      return jsonError("Lead não encontrado", 404);
    }

    if (lead.pipelineId === targetPipelineId) {
      return jsonError("O lead já está neste funil.", 400);
    }

    const targetPipeline = await prisma.pipeline.findFirst({
      where: { id: targetPipelineId, workspaceId: workspace.id, archived: false },
      include: { stages: { orderBy: { position: "asc" } } },
    });

    if (!targetPipeline) {
      return jsonError("Funil destino não encontrado", 404);
    }

    if (!targetPipeline.stages.length) {
      return jsonError("O funil destino não possui etapas.", 422);
    }

    const stageToUse = targetStageId
      ? targetPipeline.stages.find((stage) => stage.id === targetStageId) ?? targetPipeline.stages[0]
      : targetPipeline.stages[0];

    const duplicateConditions = [
      lead.email ? { email: lead.email } : undefined,
      lead.phone ? { phone: lead.phone } : undefined,
    ].filter(Boolean) as Array<Record<string, unknown>>;

    const duplicateLead = await prisma.lead.findFirst({
      where: {
        pipelineId: targetPipelineId,
        archived: false,
        pipeline: { workspaceId: workspace.id },
        ...(duplicateConditions.length ? { OR: duplicateConditions } : {}),
        createdAt: {
          gte: subDays(new Date(), 30),
        },
      },
    });

    if (duplicateLead) {
      return NextResponse.json(
        {
          error: "already_transferred",
          pipelineName: targetPipeline.name,
          leadId: duplicateLead.id,
        },
        { status: 409 },
      );
    }

    const newLead = await prisma.lead.create({
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        valueCents: lead.valueCents,
        ownerId: lead.ownerId,
        pipelineId: targetPipelineId,
        stageId: stageToUse.id,
        archived: false,
      },
    });

    if (copyActivities) {
      const recentActivities = (lead.activities ?? []).filter((activity) =>
        differenceInDays(new Date(), activity.createdAt) <= 30,
      );

      if (recentActivities.length) {
        await prisma.activity.createMany({
          data: recentActivities.map((activity) => ({
            type: activity.type,
            content: activity.content,
            dueAt: activity.dueAt,
            createdBy: activity.createdBy,
            leadId: newLead.id,
          })),
        });
      }
    }

    if (archiveSource) {
      await prisma.lead.update({
        where: { id },
        data: { archived: true },
      });
    }

    return NextResponse.json({
      newLeadId: newLead.id,
      targetPipelineId: targetPipeline.id,
      targetPipelineName: targetPipeline.name,
      targetStageId: stageToUse.id,
    });
  } catch (error) {
    console.error("POST /api/leads/[id]/transition", error);
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
