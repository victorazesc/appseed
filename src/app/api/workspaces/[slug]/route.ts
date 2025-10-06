import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { assertWorkspaceRole } from "@/lib/guards";
import { WorkspaceRole } from "@prisma/client";

const updateWorkspaceSchema = z
  .object({
    name: z.string().min(1, "Informe o nome do workspace").optional(),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/i, "Cor inválida")
      .optional(),
  })
  .refine((value) => value.name !== undefined || value.color !== undefined, {
    message: "Nenhuma alteração informada",
    path: ["name"],
  });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const context = await assertWorkspaceRole(slug, [WorkspaceRole.ADMIN, WorkspaceRole.OWNER]);

    const payload = await request.json();
    const parsed = updateWorkspaceSchema.safeParse(payload);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return jsonError(firstIssue?.message ?? "Dados inválidos", 422);
    }

    const data = parsed.data;
    const updateData: { name?: string; color?: string } = {};

    if (data.name !== undefined && data.name !== context.workspace.name) {
      updateData.name = data.name;
    }

    if (data.color !== undefined && data.color !== context.workspace.color) {
      updateData.color = data.color;
    }

    if (!Object.keys(updateData).length) {
      return NextResponse.json({
        workspace: {
          id: context.workspace.id,
          name: context.workspace.name,
          slug: context.workspace.slug,
          color: context.workspace.color,
          updated: false,
        },
      });
    }

    const updated = await prisma.workspace.update({
      where: { id: context.workspace.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
      },
    });

    return NextResponse.json({
      workspace: {
        ...updated,
        updated: true,
      },
    });
  } catch (error) {
    console.error(`PATCH /api/workspaces/${await params.then((p) => p.slug)}`, error);
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Acesso negado", 403);
    }
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      return jsonError("Workspace não encontrado", 404);
    }
    return jsonError("Erro interno", 500);
  }
}
