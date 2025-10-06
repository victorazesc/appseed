import { NextResponse } from "next/server";

import { requireWorkspace } from "@/lib/guards";
import { jsonError } from "@/lib/http";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const context = await requireWorkspace(slug);
    const membership = context.membership
      ? {
          id: context.membership.id,
          userId: context.membership.userId,
          workspaceId: context.membership.workspaceId,
          role: context.membership.role,
          createdAt: context.membership.createdAt.toISOString(),
          updatedAt: context.membership.updatedAt.toISOString(),
        }
      : null;

    return NextResponse.json({
      workspace: {
        id: context.workspace.id,
        name: context.workspace.name,
        slug: context.workspace.slug,
        color: context.workspace.color,
      },
      role: context.role,
      membership,
      impersonated: context.impersonated,
    });
  } catch (error) {
    console.error(`GET /api/me/workspaces/${await params.then((p) => p.slug)}`, error);
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      return jsonError("Workspace não encontrado", 404);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Acesso negado", 403);
    }
    return jsonError("Erro interno", 500);
  }
}
