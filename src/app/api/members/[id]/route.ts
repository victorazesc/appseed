import { NextResponse } from "next/server";
import { WorkspaceRole } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { requireWorkspace } from "@/lib/guards";
import { roleMeetsRequirement } from "@/lib/workspace";

const updateSchema = z.object({
  role: z.nativeEnum(WorkspaceRole, { errorMap: () => ({ message: "Papel inválido" }) }),
});

async function getMembership(membershipId: string) {
  return prisma.membership.findUnique({
    where: { id: membershipId },
    include: {
      workspace: {
        select: {
          id: true,
          slug: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
        },
      },
    },
  });
}

function serializeMembership(membership: NonNullable<Awaited<ReturnType<typeof getMembership>>>) {
  return {
    id: membership.id,
    role: membership.role,
    user: membership.user,
    createdAt: membership.createdAt.toISOString(),
    updatedAt: membership.updatedAt.toISOString(),
  } as const;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const payload = await request.json();
    const parsed = updateSchema.safeParse(payload);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    const membership = await getMembership(id);
    if (!membership) {
      return jsonError("Membro não encontrado", 404);
    }

    const context = await requireWorkspace(membership.workspace.slug);

    if (!roleMeetsRequirement(context.role, [WorkspaceRole.ADMIN, WorkspaceRole.OWNER])) {
      return jsonError("Acesso negado", 403);
    }

    const isSelf = membership.userId === context.user.id;
    const targetIsOwner = membership.role === WorkspaceRole.OWNER;
    const nextRole = parsed.data.role;

    if (nextRole === membership.role) {
      return NextResponse.json({ membership: serializeMembership(membership) });
    }

    if (nextRole === WorkspaceRole.OWNER && context.role !== WorkspaceRole.OWNER) {
      return jsonError("Apenas owners podem promover outros usuários a owners", 403);
    }

    if (targetIsOwner && context.role !== WorkspaceRole.OWNER && membership.userId !== context.user.id) {
      return jsonError("Apenas owners podem alterar outros owners", 403);
    }

    if (targetIsOwner && nextRole !== WorkspaceRole.OWNER) {
      const ownerCount = await prisma.membership.count({
        where: { workspaceId: membership.workspaceId, role: WorkspaceRole.OWNER },
      });
      if (ownerCount <= 1) {
        return jsonError("Não é possível remover o único owner do workspace", 400);
      }
    }

    if (isSelf && nextRole !== membership.role && context.role !== WorkspaceRole.OWNER) {
      return jsonError("Não é possível alterar seu próprio papel", 403);
    }

    const updated = await prisma.membership.update({
      where: { id: membership.id },
      data: {
        role: nextRole,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        workspace: {
          select: { id: true, slug: true },
        },
      },
    });

    return NextResponse.json({ membership: serializeMembership(updated) });
  } catch (error) {
    console.error(`PATCH /api/members/${id}`, error);
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      return jsonError("Workspace não encontrado", 404);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Acesso negado", 403);
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
    const membership = await getMembership(id);
    if (!membership) {
      return jsonError("Membro não encontrado", 404);
    }

    const context = await requireWorkspace(membership.workspace.slug);

    const isSelf = membership.userId === context.user.id;

    if (!isSelf && !roleMeetsRequirement(context.role, [WorkspaceRole.ADMIN, WorkspaceRole.OWNER])) {
      return jsonError("Acesso negado", 403);
    }

    const targetIsOwner = membership.role === WorkspaceRole.OWNER;
    if (targetIsOwner) {
      if (membership.userId !== context.user.id && context.role !== WorkspaceRole.OWNER) {
        return jsonError("Apenas owners podem remover outros owners", 403);
      }
      const ownerCount = await prisma.membership.count({
        where: { workspaceId: membership.workspaceId, role: WorkspaceRole.OWNER },
      });
      if (ownerCount <= 1) {
        return jsonError("Não é possível remover o único owner do workspace", 400);
      }
    }

    await prisma.membership.delete({ where: { id: membership.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`DELETE /api/members/${id}`, error);
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      return jsonError("Workspace não encontrado", 404);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Acesso negado", 403);
    }
    return jsonError("Erro interno", 500);
  }
}
