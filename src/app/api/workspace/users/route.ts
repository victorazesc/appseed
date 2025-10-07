import { NextRequest, NextResponse } from "next/server";
import { WorkspaceRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { requireWorkspaceFromRequest } from "@/lib/guards";

export async function GET(request: NextRequest) {
  try {
    const { workspace } = await requireWorkspaceFromRequest(request, {
      minimumRole: WorkspaceRole.VIEWER,
    });

    const memberships = await prisma.membership.findMany({
      where: { workspaceId: workspace.id },
      select: {
        role: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [
        {
          user: {
            name: "asc",
          },
        },
      ],
    });

    return NextResponse.json({
      users: memberships
        .filter((membership) => membership.user)
        .map((membership) => ({
          id: membership.user?.id ?? membership.userId,
          name: membership.user?.name ?? null,
          email: membership.user?.email ?? null,
          image: membership.user?.image ?? null,
          role: membership.role,
        })),
    });
  } catch (error) {
    console.error("GET /api/workspace/users", error);
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
