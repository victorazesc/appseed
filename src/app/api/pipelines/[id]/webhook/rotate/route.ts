import { NextResponse } from "next/server";
import { WorkspaceRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { generateWebhookToken } from "@/lib/pipeline";
import { requireWorkspaceFromRequest } from "@/lib/guards";

function buildTokenPreview(token: string) {
  if (!token) return "••••";
  return token.length <= 4 ? "••••" : `••••${token.slice(-4)}`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { workspace } = await requireWorkspaceFromRequest(request, { minimumRole: WorkspaceRole.ADMIN });

    const pipeline = await prisma.pipeline.findFirst({
      where: { id, workspaceId: workspace.id, archived: false },
      select: { id: true },
    });

    if (!pipeline) {
      return jsonError("Funil não encontrado", 404);
    }

    const token = generateWebhookToken();

    await prisma.pipeline.update({
      where: { id: pipeline.id },
      data: { webhookToken: token },
    });

    return NextResponse.json({
      token,
      tokenPreview: buildTokenPreview(token),
    });
  } catch (error) {
    console.error(`POST /api/pipelines/${id}/webhook/rotate`, error);
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
