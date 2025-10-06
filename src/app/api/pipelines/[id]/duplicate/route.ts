import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { generateUniqueWebhookSlug, generateWebhookToken } from "@/lib/pipeline";
import { requireWorkspaceFromRequest } from "@/lib/guards";
import { WorkspaceRole } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { workspace, membership } = await requireWorkspaceFromRequest(request);
    if (!membership || membership.role === WorkspaceRole.VIEWER) {
      return jsonError("Acesso negado", 403);
    }

    const pipeline = await prisma.pipeline.findFirst({
      where: { id, workspaceId: workspace.id, archived: false },
      include: {
        stages: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!pipeline) {
      return jsonError("Funil não encontrado", 404);
    }

    const cloneName = `${pipeline.name} (cópia)`;

    const duplicated = await prisma.$transaction(async (tx) => {
      const webhookToken = generateWebhookToken();
      const webhookSlug = await generateUniqueWebhookSlug(prisma, cloneName);

      const created = await tx.pipeline.create({
        data: {
          name: cloneName,
          color: pipeline.color,
          webhookToken,
          webhookSlug,
          workspaceId: pipeline.workspaceId,
          stages: {
            create: pipeline.stages.map((stage) => ({
              name: stage.name,
              position: stage.position,
              transitionMode: stage.transitionMode,
              transitionTargetPipelineId: stage.transitionTargetPipelineId,
              transitionTargetStageId: stage.transitionTargetStageId,
              transitionCopyActivities: stage.transitionCopyActivities,
              transitionArchiveSource: stage.transitionArchiveSource,
            })),
          },
        },
        include: {
          stages: {
            orderBy: { position: "asc" },
          },
          _count: {
            select: { stages: true, leads: true },
          },
        },
      });

      const defaultStage = created.stages[0];
      if (defaultStage) {
        await tx.pipeline.update({
          where: { id: created.id },
          data: { webhookDefaultStageId: defaultStage.id },
        });
      }

      return created;
    });

    return NextResponse.json({ pipeline: duplicated }, { status: 201 });
  } catch (error) {
    console.error(`POST /api/pipelines/${id}/duplicate`, error);
    if (error instanceof Error && error.message === "WORKSPACE_REQUIRED") {
      return jsonError("Workspace não informado", 400);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Acesso negado", 403);
    }
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      return jsonError("Workspace não encontrado", 404);
    }
    return jsonError("Não foi possível duplicar o funil", 500);
  }
}
