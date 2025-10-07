import { NextRequest, NextResponse } from "next/server";
import { WorkspaceRole } from "@prisma/client";

import { jsonError } from "@/lib/http";
import { activityUpdateSchema } from "@/lib/validators";
import { requireWorkspaceFromRequest } from "@/lib/guards";
import {
  deleteActivity,
  serializeActivity,
  updateActivity,
} from "@/lib/server/activity";

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
    const parsed = activityUpdateSchema.safeParse(payload);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    const updated = await updateActivity({
      activityId: id,
      workspaceId: workspace.id,
      data: {
        type: parsed.data.type,
        title: parsed.data.title ?? undefined,
        content: parsed.data.content,
        dueAt: parsed.data.dueAt ?? undefined,
        status: parsed.data.status,
        priority: parsed.data.priority,
        assigneeId: parsed.data.assigneeId ?? undefined,
        followers: parsed.data.followers,
      },
    });

    return NextResponse.json({ activity: serializeActivity(updated) });
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
    if (error instanceof Error && error.message === "ACTIVITY_NOT_FOUND") {
      return jsonError("Atividade não encontrada", 404);
    }
    if (error instanceof Error && error.message === "WORKSPACE_USER_NOT_FOUND") {
      return jsonError("Usuário não pertence ao workspace", 404);
    }
    return jsonError("Erro interno", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { workspace, membership } = await requireWorkspaceFromRequest(request);
    if (!membership || membership.role === WorkspaceRole.VIEWER) {
      return jsonError("Acesso negado", 403);
    }
    const { id } = await context.params;

    await deleteActivity(id, workspace.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`DELETE /api/activities/[id]`, error);
    if (error instanceof Error && error.message === "WORKSPACE_REQUIRED") {
      return jsonError("Workspace não informado", 400);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Acesso negado", 403);
    }
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      return jsonError("Workspace não encontrado", 404);
    }
    if (error instanceof Error && error.message === "ACTIVITY_NOT_FOUND") {
      return jsonError("Atividade não encontrada", 404);
    }
    return jsonError("Erro interno", 500);
  }
}
