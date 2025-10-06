import { cache } from "react";

import { requireWorkspace } from "@/lib/guards";

export const getWorkspaceContext = cache(async (slug: string) => {
  if (!slug) {
    throw new Error("WORKSPACE_REQUIRED");
  }

  return requireWorkspace(slug);
});

export type WorkspaceServerContext = Awaited<ReturnType<typeof getWorkspaceContext>>;
