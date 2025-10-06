import { cache } from "react";

import { prisma } from "@/lib/prisma";
import type { Pipeline } from "@/types";

import { getWorkspaceContext } from "./workspace";

function normalizePipelineDate(date: Date | string | null | undefined) {
  if (!date) return undefined;
  const instance = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(instance.getTime())) {
    return undefined;
  }
  return instance.toISOString();
}

export const getWorkspacePipelines = cache(async (slug: string): Promise<Pipeline[]> => {
  const { workspace } = await getWorkspaceContext(slug);

  const pipelines = await prisma.pipeline.findMany({
    where: { workspaceId: workspace.id, archived: false },
    include: {
      stages: { orderBy: { position: "asc" } },
      _count: { select: { stages: true, leads: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return pipelines.map((pipeline) => ({
    id: pipeline.id,
    name: pipeline.name,
    color: pipeline.color,
    archived: pipeline.archived ?? undefined,
    createdAt: normalizePipelineDate(pipeline.createdAt),
    stages: pipeline.stages.map((stage) => ({
      id: stage.id,
      name: stage.name,
      position: stage.position ?? 0,
      pipelineId: stage.pipelineId,
      transitionMode: stage.transitionMode ?? "NONE",
      transitionTargetPipelineId: stage.transitionTargetPipelineId,
      transitionTargetStageId: stage.transitionTargetStageId,
      transitionCopyActivities: stage.transitionCopyActivities ?? undefined,
      transitionArchiveSource: stage.transitionArchiveSource ?? undefined,
    })),
    _count: pipeline._count,
    webhookSlug: pipeline.webhookSlug ?? undefined,
    webhookDefaultStageId: pipeline.webhookDefaultStageId ?? undefined,
    workspaceId: pipeline.workspaceId,
  }));
});

