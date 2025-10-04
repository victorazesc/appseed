import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { metricsQuerySchema } from "@/lib/validators";

const DEFAULT_WINDOW_DAYS = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = metricsQuerySchema.safeParse({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    pipelineId: searchParams.get("pipelineId") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError("Parâmetros inválidos", 422);
  }

  const now = new Date();

  const fromDate = parsed.data.from
    ? new Date(parsed.data.from)
    : new Date(now.getTime() - DEFAULT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const toDate = parsed.data.to ? new Date(parsed.data.to) : now;

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return jsonError("Datas inválidas", 422);
  }

  if (fromDate > toDate) {
    return jsonError("Período inválido", 422);
  }

  const pipeline = await prisma.pipeline.findFirst({
    where: {
      archived: false,
      ...(parsed.data.pipelineId ? { id: parsed.data.pipelineId } : {}),
    },
    include: {
      stages: { orderBy: { position: "asc" } },
    },
  });

  if (!pipeline) {
    return jsonError("Nenhum funil encontrado", 404);
  }

  const leadsInPeriod = await prisma.lead.findMany({
    where: {
      pipelineId: pipeline.id,
      archived: false,
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    },
    select: {
      id: true,
      createdAt: true,
      valueCents: true,
      stageId: true,
    },
  });

  const stageAggregates = pipeline.stages.map((stage) => ({
    stageId: stage.id,
    stageName: stage.name,
    count: 0,
    valueCents: 0,
  }));

  const stageAggregateById = new Map(stageAggregates.map((stage) => [stage.stageId, stage]));

  for (const lead of leadsInPeriod) {
    const aggregate = stageAggregateById.get(lead.stageId ?? "");
    if (aggregate) {
      aggregate.count += 1;
      aggregate.valueCents += lead.valueCents ?? 0;
    }
  }

  const totalLeads = leadsInPeriod.length;
  const lastStageId = pipeline.stages[pipeline.stages.length - 1]?.id;
  const closedLeads = lastStageId
    ? leadsInPeriod.filter((lead) => lead.stageId === lastStageId).length
    : 0;

  const conversionRatePct = totalLeads === 0 ? 0 : (closedLeads / totalLeads) * 100;

  const avgTimeDays =
    totalLeads === 0
      ? 0
      :
          leadsInPeriod.reduce((acc, lead) => {
            const diffMs = now.getTime() - lead.createdAt.getTime();
            return acc + diffMs / (1000 * 60 * 60 * 24);
          }, 0) / totalLeads;

  return NextResponse.json({
    pipeline: {
      id: pipeline.id,
      name: pipeline.name,
      color: pipeline.color,
    },
    leads_per_stage: stageAggregates,
    conversion_rate_pct: Number(conversionRatePct.toFixed(2)),
    avg_time_days: Number(avgTimeDays.toFixed(2)),
  });
}
