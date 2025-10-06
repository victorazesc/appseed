import { NextRequest, NextResponse } from "next/server";
import { WorkspaceRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { requireWorkspaceFromRequest } from "@/lib/guards";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { workspace, membership } = await requireWorkspaceFromRequest(request);
    if (!membership || membership.role === WorkspaceRole.VIEWER) {
      return jsonError("Acesso negado", 403);
    }
    const { id } = await context.params;
    const payload = await request.json().catch(() => ({}));

    if (payload?.action !== "complete") {
      return jsonError("Ação inválida", 400);
    }

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            pipeline: {
              select: {
                workspaceId: true,
              },
            },
          },
        },
      },
    });

    if (!activity || activity.lead?.pipeline?.workspaceId !== workspace.id) {
      return jsonError("Atividade não encontrada", 404);
    }

    if (activity.type !== "task") {
      return jsonError("Apenas tarefas podem ser concluídas", 400);
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        type: "note",
        content: `Tarefa concluída: ${activity.content}`,
        dueAt: null,
      },
    });

    return NextResponse.json({ activity: updated });
  } catch (error) {
    console.error(`PATCH /api/activities/[id]`, error);
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
