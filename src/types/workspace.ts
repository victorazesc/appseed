import type { WorkspaceRole } from "@prisma/client";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  color: string;
  role?: WorkspaceRole;
};

export type WorkspaceMembership = {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceContextData = {
  workspace: Workspace | null;
  role: WorkspaceRole | null;
  membership: WorkspaceMembership | null;
  impersonated: boolean;
};

export type WorkspaceUserSummary = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: WorkspaceRole;
};

export { WorkspaceRole };
