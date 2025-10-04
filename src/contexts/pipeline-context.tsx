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

import { apiFetch } from "@/lib/api-client";
import type { Pipeline } from "@/types";

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

async function fetchPipelines() {
  const response = await apiFetch<{ pipelines: Pipeline[] }>("/api/pipelines");
  return response.pipelines;
}

export function PipelineProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [activePipelineId, setActivePipelineIdState] = useState<string | null>(null);

  const { data: pipelines = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["pipelines"],
    queryFn: fetchPipelines,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlPipelineId = searchParams?.get("pipelineId");
    if (urlPipelineId) {
      setActivePipelineIdState(urlPipelineId);
      window.localStorage.setItem(PIPELINE_STORAGE_KEY, urlPipelineId);
      return;
    }

    const stored = window.localStorage.getItem(PIPELINE_STORAGE_KEY);
    if (stored) {
      setActivePipelineIdState(stored);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && pipelines.length > 0 && !activePipelineId) {
      setActivePipelineIdState(pipelines[0].id);
    }
  }, [isLoading, pipelines, activePipelineId]);

  useEffect(() => {
    if (!pipelines.length) return;
    if (activePipelineId && pipelines.some((pipeline) => pipeline.id === activePipelineId)) {
      return;
    }
    setActivePipelineIdState(pipelines[0].id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PIPELINE_STORAGE_KEY, pipelines[0].id);
    }
  }, [pipelines, activePipelineId]);

  const activePipeline = useMemo(
    () => pipelines.find((pipeline) => pipeline.id === activePipelineId) ?? null,
    [activePipelineId, pipelines],
  );

  const setActivePipelineId = useCallback(
    (pipelineId: string) => {
      setActivePipelineIdState(pipelineId);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(PIPELINE_STORAGE_KEY, pipelineId);
      }

      if (searchParams && router) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("pipelineId", pipelineId);
        router.replace(`${pathname}?${params.toString()}`);
      }

      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["stages"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
    [pathname, router, searchParams, queryClient],
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
