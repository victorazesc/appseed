import { NextResponse } from "next/server";
import { WorkspaceRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { requireWorkspace } from "@/lib/guards";
import { roleMeetsRequirement } from "@/lib/workspace";

async function fetchMemberships(workspaceId: string) {
  return prisma.membership.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      invitedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

function serializeMembership(membership: Awaited<ReturnType<typeof fetchMemberships>>[number]) {
  return {
    id: membership.id,
    role: membership.role,
    user: {
      id: membership.user.id,
      name: membership.user.name,
      email: membership.user.email,
      image: membership.user.image,
    },
    invitedBy: membership.invitedBy
      ? {
          id: membership.invitedBy.id,
          name: membership.invitedBy.name,
          email: membership.invitedBy.email,
        }
      : null,
    createdAt: membership.createdAt.toISOString(),
    updatedAt: membership.updatedAt.toISOString(),
  } as const;
}

async function fetchInvites(workspaceId: string) {
  return prisma.invite.findMany({
    where: { workspaceId, acceptedAt: null, expiresAt: { gt: new Date() } },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

function serializeInvite(invite: Awaited<ReturnType<typeof fetchInvites>>[number]) {
  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    token: invite.token,
    createdBy: invite.createdBy
      ? {
          id: invite.createdBy.id,
          name: invite.createdBy.name,
          email: invite.createdBy.email,
        }
      : null,
    createdAt: invite.createdAt.toISOString(),
    expiresAt: invite.expiresAt.toISOString(),
  } as const;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const context = await requireWorkspace(slug);

    if (!roleMeetsRequirement(context.role, [WorkspaceRole.ADMIN, WorkspaceRole.OWNER])) {
      return jsonError("Acesso negado", 403);
    }

    const [memberships, invites] = await Promise.all([
      fetchMemberships(context.workspace.id),
      fetchInvites(context.workspace.id),
    ]);

    return NextResponse.json({
      memberships: memberships.map(serializeMembership),
      invites: invites.map(serializeInvite),
    });
  } catch (error) {
    console.error(`GET /api/workspaces/${slug}/members`, error);
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      return jsonError("Workspace não encontrado", 404);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return jsonError("Acesso negado", 403);
    }
    return jsonError("Erro interno", 500);
  }
}
