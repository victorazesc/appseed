"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api-client";
import type {
  Workspace,
  WorkspaceContextData,
  WorkspaceMembership,
  WorkspaceRole,
} from "@/types/workspace";

export type WorkspaceContextValue = {
  isLoading: boolean;
  workspace: Workspace | null;
  role: WorkspaceRole | null;
  membership: WorkspaceMembership | null;
  impersonated: boolean;
  memberships: Workspace[];
  setActiveWorkspace: (slug: string) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

async function fetchMemberships() {
  const response = await apiFetch<{ workspaces: Workspace[] }>("/api/me/workspaces");
  return response.workspaces;
}

type WorkspaceApiResponse = {
  workspace: Workspace;
  role: WorkspaceRole;
  membership: WorkspaceMembership | null;
  impersonated: boolean;
};

async function fetchWorkspace(slug: string) {
  const response = await apiFetch<WorkspaceApiResponse>(`/api/me/workspaces/${slug}`);
  return response;
}

type WorkspaceProviderProps = {
  children: React.ReactNode;
  initialContext?: WorkspaceContextData;
};

export function WorkspaceProvider({ children, initialContext }: WorkspaceProviderProps) {
  const params = useParams<{ workspaceSlug?: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const paramSlug = typeof params?.workspaceSlug === "string" ? params.workspaceSlug : undefined;
  const fallbackSlug = initialContext?.workspace?.slug;
  const [currentSlug, setCurrentSlug] = useState<string | undefined>(paramSlug ?? fallbackSlug);

  useEffect(() => {
    if (paramSlug && paramSlug !== currentSlug) {
      setCurrentSlug(paramSlug);
      return;
    }

    if (!paramSlug && fallbackSlug && fallbackSlug !== currentSlug) {
      setCurrentSlug(fallbackSlug);
    }
  }, [paramSlug, fallbackSlug, currentSlug]);

  const workspaceInitialData = useMemo<WorkspaceApiResponse | undefined>(() => {
    if (!initialContext?.workspace || !initialContext.role) {
      return undefined;
    }

    if (!currentSlug || initialContext.workspace.slug !== currentSlug) {
      return undefined;
    }

    return {
      workspace: initialContext.workspace,
      role: initialContext.role,
      membership: initialContext.membership ?? null,
      impersonated: initialContext.impersonated,
    } satisfies WorkspaceApiResponse;
  }, [initialContext, currentSlug]);

  const membershipsQuery = useQuery({
    queryKey: ["workspace-memberships"],
    queryFn: fetchMemberships,
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const workspaceQuery = useQuery({
    queryKey: ["workspace", currentSlug],
    queryFn: () => fetchWorkspace(currentSlug!),
    enabled: Boolean(currentSlug),
    initialData: workspaceInitialData,
    initialDataUpdatedAt: workspaceInitialData ? Date.now() : undefined,
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const setActiveWorkspace = useCallback(
    (slug: string) => {
      if (!pathname) return;
      if (!slug) return;

      if (currentSlug === slug) {
        return;
      }

      const segments = pathname.split("/").filter(Boolean);

      if (!segments.length) {
        router.push(`/${slug}/dashboard`);
      } else {
        segments[0] = slug;
        router.push(`/${segments.join("/")}`);
      }

      setCurrentSlug(slug);

      queryClient.invalidateQueries({ queryKey: ["workspace-memberships"] });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", slug] });
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      queryClient.invalidateQueries({ queryKey: ["pipelines", slug] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", slug] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients", slug] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["metrics", slug] });
      queryClient.invalidateQueries({ queryKey: ["stages"] });
      queryClient.invalidateQueries({ queryKey: ["stages", slug] });
      queryClient.invalidateQueries({ queryKey: ["lead"] });
      queryClient.invalidateQueries({ queryKey: ["lead", slug] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", slug] });

      if (currentSlug && currentSlug !== slug) {
        queryClient.removeQueries({ queryKey: ["workspace", currentSlug], exact: true });
        queryClient.removeQueries({ queryKey: ["pipelines", currentSlug], exact: true });
        queryClient.removeQueries({ queryKey: ["leads", currentSlug], exact: false });
        queryClient.removeQueries({ queryKey: ["metrics", currentSlug], exact: true });
        queryClient.removeQueries({ queryKey: ["stages", currentSlug], exact: true });
        queryClient.removeQueries({ queryKey: ["clients", currentSlug], exact: false });
        queryClient.removeQueries({ queryKey: ["lead", currentSlug], exact: false });
        queryClient.removeQueries({ queryKey: ["notifications", currentSlug], exact: false });
      }
    },
    [currentSlug, pathname, queryClient, router],
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      isLoading: membershipsQuery.isLoading || workspaceQuery.isLoading,
      workspace: workspaceQuery.data?.workspace ?? null,
      role: workspaceQuery.data?.role ?? null,
      membership: workspaceQuery.data?.membership ?? null,
      impersonated: workspaceQuery.data?.impersonated ?? false,
      memberships: membershipsQuery.data ?? [],
      setActiveWorkspace,
    }),
    [
      membershipsQuery.data,
      membershipsQuery.isLoading,
      setActiveWorkspace,
      workspaceQuery.data?.impersonated,
      workspaceQuery.data?.membership,
      workspaceQuery.data?.role,
      workspaceQuery.data?.workspace,
      workspaceQuery.isLoading,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace deve ser usado dentro de WorkspaceProvider");
  }
  return context;
}
