"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { useWorkspace } from "@/contexts/workspace-context";
import type { WorkspaceUserSummary } from "@/types/workspace";

export function useWorkspaceUsers() {
  const { workspace } = useWorkspace();
  const slug = workspace?.slug;

  return useQuery({
    queryKey: ["workspace-users", slug],
    queryFn: async () => {
      if (!slug) return [] as WorkspaceUserSummary[];
      const params = new URLSearchParams({ workspaceSlug: slug });
      const response = await apiFetch<{ users: WorkspaceUserSummary[] }>(
        `/api/workspace/users?${params.toString()}`,
      );
      return response.users;
    },
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}
