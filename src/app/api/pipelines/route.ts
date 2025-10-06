import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { pipelineCreateSchema } from "@/lib/validators";
import { generateUniqueWebhookSlug, generateWebhookToken } from "@/lib/pipeline";
import { requireWorkspaceFromRequest } from "@/lib/guards";
import { WorkspaceRole } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { workspace } = await requireWorkspaceFromRequest(request, { minimumRole: WorkspaceRole.VIEWER });

    const pipelines = await prisma.pipeline.findMany({
      where: { archived: false, workspaceId: workspace.id },
      include: {
        stages: {
          orderBy: { position: "asc" },
        },
        _count: {
          select: { stages: true, leads: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ pipelines });
  } catch (error) {
    console.error("GET /api/pipelines", error);
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
    const { workspace, membership } = await requireWorkspaceFromRequest(request);
    if (!membership || (membership.role !== WorkspaceRole.ADMIN && membership.role !== WorkspaceRole.OWNER)) {
      return jsonError("Acesso negado", 403);
    }
    const payload = await request.json();
    const parsed = pipelineCreateSchema.safeParse(payload);

    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Dados inválidos", 422);
    }

    const { name, color, stages } = parsed.data;

    const pipeline = await prisma.$transaction(async (tx) => {
      const webhookToken = generateWebhookToken();
      const webhookSlug = await generateUniqueWebhookSlug(prisma, name);

      const created = await tx.pipeline.create({
        data: {
          name,
          color,
          webhookToken,
          webhookSlug,
          workspaceId: workspace.id,
          stages: {
            create: stages.map((stage, index) => ({
              name: stage.name,
              position: index,
              transitionMode: stage.transitionMode ?? "NONE",
              transitionTargetPipelineId:
                stage.transitionMode && stage.transitionMode !== "NONE"
                  ? stage.transitionTargetPipelineId ?? null
                  : null,
              transitionTargetStageId:
                stage.transitionMode && stage.transitionMode !== "NONE"
                  ? stage.transitionTargetStageId ?? null
                  : null,
              transitionCopyActivities: stage.transitionCopyActivities ?? true,
              transitionArchiveSource: stage.transitionArchiveSource ?? false,
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

    return NextResponse.json({ pipeline }, { status: 201 });
  } catch (error) {
    console.error("POST /api/pipelines", error);
    if (error instanceof Error && error.message === "WORKSPACE_REQUIRED") {
      return jsonError("Workspace não informado", 400);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Acesso negado", 403);
    }
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      return jsonError("Workspace não encontrado", 404);
    }
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return jsonError("Já existe um funil com esse nome", 409);
    }
    return jsonError("Erro interno", 500);
  }
}
