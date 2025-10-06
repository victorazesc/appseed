import { WorkspaceRole } from "@prisma/client";

export const WORKSPACE_ROLE_PRIORITY: Record<WorkspaceRole, number> = {
  [WorkspaceRole.OWNER]: 4,
  [WorkspaceRole.ADMIN]: 3,
  [WorkspaceRole.MEMBER]: 2,
  [WorkspaceRole.VIEWER]: 1,
};

export function roleMeetsRequirement(role: WorkspaceRole, allowed: WorkspaceRole[]) {
  if (!allowed.length) return false;
  const minRequired = Math.min(...allowed.map((item) => WORKSPACE_ROLE_PRIORITY[item]));
  return WORKSPACE_ROLE_PRIORITY[role] >= minRequired;
}

export function isHigherOrEqualRole(role: WorkspaceRole, target: WorkspaceRole) {
  return WORKSPACE_ROLE_PRIORITY[role] >= WORKSPACE_ROLE_PRIORITY[target];
}
