import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { pipelineUpdateSchema } from "@/lib/validators";
import { requireWorkspaceFromRequest } from "@/lib/guards";
import { WorkspaceRole } from "@prisma/client";

function includeConfig() {
  return {
    stages: {
      orderBy: { position: "asc" },
    },
    _count: {
      select: { stages: true, leads: true },
    },
  } as const;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { workspace } = await requireWorkspaceFromRequest(request, { minimumRole: WorkspaceRole.VIEWER });

    const pipeline = await prisma.pipeline.findFirst({
      where: { id, workspaceId: workspace.id, archived: false },
      include: includeConfig(),
    });

    if (!pipeline) {
      return jsonError("Funil não encontrado", 404);
    }

    return NextResponse.json({ pipeline });
  } catch (error) {
    console.error(`GET /api/pipelines/${id}`, error);
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { workspace, membership } = await requireWorkspaceFromRequest(request);
    if (!membership || (membership.role !== WorkspaceRole.ADMIN && membership.role !== WorkspaceRole.OWNER)) {
      return jsonError("Acesso negado", 403);
    }

    const existing = await prisma.pipeline.findFirst({
      where: { id, workspaceId: workspace.id, archived: false },
      include: { stages: true },
    });

    if (!existing) {
      return jsonError("Funil não encontrado", 404);
    }

    const payload = await request.json();
    const parsed = pipelineUpdateSchema.safeParse(payload);

    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Dados inválidos", 422);
    }

    const { name, color, stages } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      if (name || color) {
        await tx.pipeline.update({
          where: { id },
          data: {
            ...(name ? { name } : {}),
            ...(color ? { color } : {}),
          },
        });
      }

      if (stages) {
        const stageIdsFromPayload = new Set(
          stages.filter((stage) => stage.id).map((stage) => stage.id as string),
        );
        const stagesToDelete = existing.stages.filter((stage) => !stageIdsFromPayload.has(stage.id));

        if (stagesToDelete.length) {
          await tx.stage.deleteMany({
            where: {
              id: { in: stagesToDelete.map((stage) => stage.id) },
              pipeline: { id, workspaceId: workspace.id },
            },
          });
        }

        for (const [index, stage] of stages.entries()) {
          const transitionMode = stage.transitionMode ?? "NONE";
          const baseData = {
            name: stage.name,
            position: index,
            transitionMode,
            transitionTargetPipelineId:
              transitionMode === "NONE" ? null : stage.transitionTargetPipelineId ?? null,
            transitionTargetStageId:
              transitionMode === "NONE" ? null : stage.transitionTargetStageId ?? null,
            transitionCopyActivities: stage.transitionCopyActivities ?? true,
            transitionArchiveSource: stage.transitionArchiveSource ?? false,
          } as const;

          if (stage.id) {
            await tx.stage.update({
              where: { id: stage.id, pipelineId: id },
              data: baseData,
            });
          } else {
            await tx.stage.create({
              data: {
                ...baseData,
                pipelineId: id,
              },
            });
          }
        }
      }

      const pipeline = await tx.pipeline.findFirst({
        where: { id, workspaceId: workspace.id },
        include: includeConfig(),
      });

      if (!pipeline) {
        return pipeline;
      }

      const hasValidDefault = pipeline.webhookDefaultStageId
        ? pipeline.stages.some((stage) => stage.id === pipeline.webhookDefaultStageId)
        : false;

      if (!hasValidDefault) {
        const fallbackStageId = pipeline.stages[0]?.id ?? null;
        if (fallbackStageId !== pipeline.webhookDefaultStageId) {
          await tx.pipeline.update({
            where: { id },
            data: { webhookDefaultStageId: fallbackStageId },
          });
          return tx.pipeline.findFirst({ where: { id, workspaceId: workspace.id }, include: includeConfig() });
        }
      }

      return pipeline;
    });

    return NextResponse.json({ pipeline: result });
  } catch (error) {
    console.error(`PATCH /api/pipelines/${id}`, error);
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
      return jsonError("Já existe uma etapa com esse nome", 409);
    }
    return jsonError("Erro interno", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { workspace, membership } = await requireWorkspaceFromRequest(request);
    if (!membership || (membership.role !== WorkspaceRole.ADMIN && membership.role !== WorkspaceRole.OWNER)) {
      return jsonError("Acesso negado", 403);
    }

    const existing = await prisma.pipeline.findFirst({
      where: { id, workspaceId: workspace.id, archived: false },
      select: { id: true },
    });

    if (!existing) {
      return jsonError("Funil não encontrado", 404);
    }

    await prisma.pipeline.update({
      where: { id },
      data: { archived: true },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`DELETE /api/pipelines/${id}`, error);
    if (error instanceof Error && error.message === "WORKSPACE_REQUIRED") {
      return jsonError("Workspace não informado", 400);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Acesso negado", 403);
    }
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      return jsonError("Workspace não encontrado", 404);
    }
    return jsonError("Erro ao remover funil", 500);
  }
}
