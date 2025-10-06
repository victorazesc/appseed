"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import type { MetricsOverview } from "@/types";
import { useTranslation } from "@/contexts/i18n-context";
import { useActivePipeline } from "@/contexts/pipeline-context";
import { useWorkspace } from "@/contexts/workspace-context";

const buildKey = (
  workspaceSlug: string | undefined,
  params: { from?: string; to?: string; pipelineId?: string },
) => ["metrics", workspaceSlug ?? "unknown", params] as const;

export default function MetricsPage() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const { messages } = useTranslation();
  const { crm } = messages;
  const copy = crm.metrics;
  const { activePipeline, activePipelineId } = useActivePipeline();
  const { workspace, isLoading: isWorkspaceLoading } = useWorkspace();
  const workspaceSlug = workspace?.slug;

  const metricsQuery = useQuery({
    queryKey: buildKey(workspaceSlug, {
      from: from || undefined,
      to: to || undefined,
      pipelineId: activePipelineId ?? undefined,
    }),
    queryFn: async () => {
      if (!activePipelineId || !workspaceSlug) return null;
      const params = new URLSearchParams();
      params.set("pipelineId", activePipelineId);
      params.set("workspaceSlug", workspaceSlug);
      if (from) params.set("from", new Date(from).toISOString());
      if (to) params.set("to", new Date(to).toISOString());
      const qs = params.toString();
      const data = await apiFetch<MetricsOverview>(`/api/metrics/overview?${qs}`);
      return data;
    },
    enabled: Boolean(activePipelineId && workspaceSlug),
    onError: (error: Error) => toast.error(error.message),
  });

  const chartData = useMemo(() => {
    if (!metricsQuery.data) return [];
    return metricsQuery.data.leads_per_stage.map((entry) => ({
      stage: entry.stageName,
      value: entry.count,
    }));
  }, [metricsQuery.data]);

  const totalValue = useMemo(() => {
    if (!metricsQuery.data) return 0;
    return metricsQuery.data.leads_per_stage.reduce((acc, current) => acc + current.valueCents, 0);
  }, [metricsQuery.data]);

  if (!workspaceSlug) {
    if (isWorkspaceLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
        Escolha um workspace para visualizar as métricas.
      </div>
    );
  }

  const handleApply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    metricsQuery.refetch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-4 md:grid-cols-4" onSubmit={handleApply}>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="metrics-from">
                {copy.filters.from}
              </label>
              <Input
                id="metrics-from"
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                disabled={!activePipelineId}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="metrics-to">
                {copy.filters.to}
              </label>
              <Input
                id="metrics-to"
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                disabled={!activePipelineId}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={metricsQuery.isFetching || !activePipelineId}>
                {metricsQuery.isFetching ? copy.filters.applying : copy.filters.apply}
              </Button>
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setFrom("");
                  setTo("");
                  metricsQuery.refetch();
                }}
                disabled={!activePipelineId}
              >
                {copy.filters.clear}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {!activePipelineId ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {crm.dashboard.emptyPipelines.description}
        </div>
      ) : metricsQuery.isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
          <Card className="md:col-span-3">
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : metricsQuery.isError ? (
        <p className="text-sm text-destructive">{copy.empty}</p>
      ) : metricsQuery.data ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">{copy.cards.leadsPerStage}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {metricsQuery.data.leads_per_stage.map((entry) => (
                  <div key={entry.stageId} className="flex items-center justify-between text-sm">
                    <span>{entry.stageName}</span>
                    <Badge variant="secondary">{entry.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">{copy.cards.conversion}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-foreground">
                  {metricsQuery.data.conversion_rate_pct.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">{copy.cards.conversionHint}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">{copy.cards.timeInPipeline}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-foreground">
                  {copy.cards.timeUnit.replace(
                    "{{days}}",
                    metricsQuery.data.avg_time_days.toFixed(1),
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{copy.cards.timeHint}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{copy.chart.distribution}</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="stage" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={activePipeline?.color ?? "#16A34A"}
                    fill={activePipeline?.color ?? "#16A34A"}
                    fillOpacity={0.25}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{copy.table.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-muted-foreground">
                      <th className="pb-2">{copy.table.stage}</th>
                      <th className="pb-2">{copy.table.total}</th>
                      <th className="pb-2 text-right">{copy.table.value}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricsQuery.data.leads_per_stage.map((entry) => (
                      <tr key={entry.stageId} className="border-t text-sm">
                        <td className="py-2">{entry.stageName}</td>
                        <td className="py-2">{entry.count}</td>
                        <td className="py-2 text-right">{formatCurrency(entry.valueCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-end text-sm text-muted-foreground">
                <span>
                  Total: <strong className="text-foreground">{formatCurrency(totalValue)}</strong>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{copy.empty}</p>
      )}
    </div>
  );
}
