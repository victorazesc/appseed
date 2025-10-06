"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api-client";
import type { Pipeline } from "@/types";
import { useWorkspace } from "@/contexts/workspace-context";

const PIPELINE_STORAGE_KEY = "appseed:pipeline";

interface PipelineContextValue {
  pipelines: Pipeline[];
  isLoading: boolean;
  isFetching: boolean;
  activePipeline?: Pipeline | null;
  activePipelineId?: string | null;
  setActivePipelineId: (pipelineId: string) => void;
  refetch: () => void;
}

const PipelineContext = createContext<PipelineContextValue | undefined>(undefined);

async function fetchPipelines(workspaceSlug: string) {
  const response = await apiFetch<{ pipelines: Pipeline[] }>(
    `/api/pipelines?workspaceSlug=${encodeURIComponent(workspaceSlug)}`,
  );
  return response.pipelines;
}

type PipelineProviderProps = {
  children: React.ReactNode;
  initialPipelines?: Pipeline[];
  initialPipelineId?: string | null;
};

export function PipelineProvider({ children, initialPipelines, initialPipelineId }: PipelineProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [activePipelineId, setActivePipelineIdState] = useState<string | null>(() => initialPipelineId ?? null);
  const { workspace } = useWorkspace();
  const workspaceSlug = workspace?.slug;
  const storageKey = workspaceSlug ? `${PIPELINE_STORAGE_KEY}:${workspaceSlug}` : PIPELINE_STORAGE_KEY;

  const pipelinesQuery = useQuery({
    queryKey: ["pipelines", workspaceSlug],
    queryFn: () => fetchPipelines(workspaceSlug!),
    enabled: Boolean(workspaceSlug),
    initialData: initialPipelines,
    initialDataUpdatedAt: initialPipelines ? Date.now() : undefined,
  });
  const { data: pipelines = [], isLoading, isFetching, refetch } = pipelinesQuery;

  useEffect(() => {
    if (pipelinesQuery.isError) {
      const err = pipelinesQuery.error as Error | null;
      toast.error(err?.message ?? "Erro ao carregar funis.");
      setActivePipelineIdState(null);
      if (typeof window !== "undefined" && workspaceSlug) {
        window.localStorage.removeItem(storageKey);
      }
    }
  }, [pipelinesQuery.isError, pipelinesQuery.error, workspaceSlug, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!workspaceSlug) {
      setActivePipelineIdState(null);
      return;
    }

    const urlPipelineId = searchParams?.get("pipelineId");
    if (urlPipelineId) {
      setActivePipelineIdState(urlPipelineId);
      window.localStorage.setItem(storageKey, urlPipelineId);
      return;
    }

    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      setActivePipelineIdState(stored);
    }
  }, [searchParams, storageKey, workspaceSlug]);

  useEffect(() => {
    if (!workspaceSlug) {
      setActivePipelineIdState(null);
      return;
    }

    if (!isLoading && pipelines.length > 0 && !activePipelineId) {
      setActivePipelineIdState(pipelines[0].id);
    }
  }, [isLoading, pipelines, activePipelineId, workspaceSlug]);

  useEffect(() => {
    if (!workspaceSlug) {
      return;
    }

    if (!activePipelineId && initialPipelineId) {
      setActivePipelineIdState(initialPipelineId);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, initialPipelineId);
      }
    }
  }, [workspaceSlug, initialPipelineId, activePipelineId, storageKey]);

  useEffect(() => {
    if (!pipelines.length) {
      return;
    }
    if (activePipelineId && pipelines.some((pipeline) => pipeline.id === activePipelineId)) {
      return;
    }
    setActivePipelineIdState(pipelines[0].id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, pipelines[0].id);
    }
  }, [pipelines, activePipelineId, storageKey]);

  const activePipeline = useMemo(
    () => pipelines.find((pipeline) => pipeline.id === activePipelineId) ?? null,
    [activePipelineId, pipelines],
  );

  const setActivePipelineId = useCallback(
    (pipelineId: string) => {
      setActivePipelineIdState(pipelineId);
      if (typeof window !== "undefined" && storageKey) {
        window.localStorage.setItem(storageKey, pipelineId);
      }

      if (searchParams && router) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("pipelineId", pipelineId);
        router.replace(`${pathname}?${params.toString()}`);
      }

      queryClient.invalidateQueries({ queryKey: ["leads", workspaceSlug] });
      queryClient.invalidateQueries({ queryKey: ["stages", workspaceSlug] });
      queryClient.invalidateQueries({ queryKey: ["metrics", workspaceSlug] });
    },
    [pathname, router, searchParams, queryClient, workspaceSlug, storageKey],
  );

  const value = useMemo<PipelineContextValue>(
    () => ({
      pipelines,
      isLoading,
      isFetching,
      activePipeline,
      activePipelineId,
      setActivePipelineId,
      refetch,
    }),
    [pipelines, isLoading, isFetching, activePipeline, activePipelineId, setActivePipelineId, refetch],
  );

  return <PipelineContext.Provider value={value}>{children}</PipelineContext.Provider>;
}

export function usePipelines() {
  const context = useContext(PipelineContext);
  if (!context) {
    throw new Error("usePipelines must be used within a PipelineProvider");
  }
  return context;
}

export function useActivePipeline() {
  const { activePipeline, activePipelineId, setActivePipelineId, isLoading, isFetching } = usePipelines();
  return { activePipeline, activePipelineId, setActivePipelineId, isLoading, isFetching };
}
