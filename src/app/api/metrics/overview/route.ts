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

  const [stages, leadsInPeriod] = await Promise.all([
    prisma.stage.findMany({
      orderBy: { position: "asc" },
      select: { id: true, name: true },
    }),
    prisma.lead.findMany({
      where: {
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      select: {
        id: true,
        createdAt: true,
        stage: {
          select: { name: true },
        },
      },
    }),
  ]);

  const leadsPerStage = Object.fromEntries(
    stages.map((stage) => [stage.name, 0])
  );

  for (const lead of leadsInPeriod) {
    const stageName = lead.stage?.name;
    if (stageName && stageName in leadsPerStage) {
      leadsPerStage[stageName] += 1;
    }
  }

  const totalLeads = leadsInPeriod.length;
  const closedLeads = leadsInPeriod.filter(
    (lead) => lead.stage?.name === "Fechamento"
  ).length;

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
    leads_per_stage: leadsPerStage,
    conversion_rate_pct: Number(conversionRatePct.toFixed(2)),
    avg_time_days: Number(avgTimeDays.toFixed(2)),
  });
}
