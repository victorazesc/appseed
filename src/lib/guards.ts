import { GlobalRole, WorkspaceRole } from "@prisma/client";

import { assertAuthenticated, getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roleMeetsRequirement } from "@/lib/workspace";

export type SessionUser = Awaited<ReturnType<typeof getSessionUser>>;

export async function assertGlobal() {
  const user = await assertAuthenticated();
  if (user.globalRole !== GlobalRole.ADMIN_GLOBAL) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function getWorkspaceBySlug(slug: string) {
  return prisma.workspace.findUnique({ where: { slug } });
}

export async function requireWorkspace(slug: string) {
  const user = await assertAuthenticated();

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      memberships: {
        where: { userId: user.id },
      },
    },
  });

  if (!workspace || workspace.archived) {
    throw new Error("WORKSPACE_NOT_FOUND");
  }

  const impersonated = user.impersonatedWorkspaceId === workspace.id;
  const membership = workspace.memberships[0] ?? null;

  if (!impersonated && !membership) {
    throw new Error("FORBIDDEN");
  }

  const role = impersonated
    ? WorkspaceRole.ADMIN
    : membership?.role ?? WorkspaceRole.VIEWER;

  return {
    user,
    workspace,
    membership,
    role,
    impersonated,
  } as const;
}

export async function assertWorkspaceRole(slug: string, allowed: WorkspaceRole[]) {
  const context = await requireWorkspace(slug);
  if (!roleMeetsRequirement(context.role, allowed)) {
    throw new Error("FORBIDDEN");
  }
  return context;
}

export async function requireWorkspaceFromRequest(request: Request, { minimumRole = WorkspaceRole.VIEWER } = {}) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("workspaceSlug");
  if (!slug) {
    throw new Error("WORKSPACE_REQUIRED");
  }

  const context = await requireWorkspace(slug);
  if (!roleMeetsRequirement(context.role, [minimumRole])) {
    throw new Error("FORBIDDEN");
  }

  return { slug, ...context } as const;
}
