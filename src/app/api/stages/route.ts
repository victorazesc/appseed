import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { requireWorkspaceFromRequest } from "@/lib/guards";
import { WorkspaceRole } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { workspace } = await requireWorkspaceFromRequest(request, { minimumRole: WorkspaceRole.VIEWER });
    const { searchParams } = new URL(request.url);
    const pipelineId = searchParams.get("pipelineId") ?? undefined;

    if (pipelineId) {
      const pipeline = await prisma.pipeline.findFirst({
        where: {
          id: pipelineId,
          workspaceId: workspace.id,
          archived: false,
        },
        select: { id: true },
      });

      if (!pipeline) {
        return jsonError("Pipeline não encontrado", 404);
      }
    }

    const stages = await prisma.stage.findMany({
      where: {
        ...(pipelineId ? { pipelineId } : {}),
        pipeline: { archived: false, workspaceId: workspace.id },
      },
      orderBy: [{ pipelineId: "asc" }, { position: "asc" }],
      select: {
        id: true,
        name: true,
        position: true,
        pipelineId: true,
      },
    });

    return NextResponse.json({ stages });
  } catch (error) {
    console.error("GET /api/stages", error);
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
