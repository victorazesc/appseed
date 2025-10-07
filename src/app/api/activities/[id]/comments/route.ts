import { NextRequest, NextResponse } from "next/server";
import { WorkspaceRole } from "@prisma/client";

import { jsonError } from "@/lib/http";
import { activityCommentSchema } from "@/lib/validators";
import { requireWorkspaceFromRequest } from "@/lib/guards";
import { getSessionUser } from "@/lib/auth";
import {
  createActivityComment,
  serializeComment,
} from "@/lib/server/activity";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const { workspace, membership } = await requireWorkspaceFromRequest(request);
    if (!membership || membership.role === WorkspaceRole.VIEWER) {
      return jsonError("Acesso negado", 403);
    }
    const payload = await request.json();
    const parsed = activityCommentSchema.safeParse(payload);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    const sessionUser = await getSessionUser();

    const comment = await createActivityComment({
      activityId: id,
      workspaceId: workspace.id,
      authorId: sessionUser?.id ?? null,
      content: parsed.data.content,
      mentions: parsed.data.mentions,
    });

    return NextResponse.json(
      { comment: serializeComment(comment) },
      { status: 201 },
    );
  } catch (error) {
    console.error(`POST /api/activities/${id}/comments`, error);
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
