"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import type { MetricsOverview } from "@/types";

const buildKey = (params: { from?: string; to?: string }) => ["metrics", params] as const;

export default function MetricsPage() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const metricsQuery = useQuery({
    queryKey: buildKey({ from: from || undefined, to: to || undefined }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.set("from", new Date(from).toISOString());
      if (to) params.set("to", new Date(to).toISOString());
      const qs = params.toString();
      const data = await apiFetch<MetricsOverview>(
        qs ? `/api/metrics/overview?${qs}` : `/api/metrics/overview`,
      );
      return data;
    },
  });

  const chartData = useMemo(() => {
    if (!metricsQuery.data) return [];
    return Object.entries(metricsQuery.data.leads_per_stage).map(([stage, value]) => ({
      stage,
      value,
    }));
  }, [metricsQuery.data]);

  const handleApply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    metricsQuery.refetch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Métricas do funil</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-4 md:grid-cols-4" onSubmit={handleApply}>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="metrics-from">
                De
              </label>
              <Input
                id="metrics-from"
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="metrics-to">
                Até
              </label>
              <Input
                id="metrics-to"
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={metricsQuery.isFetching}>
                {metricsQuery.isFetching ? "Atualizando..." : "Aplicar"}
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
              >
                Limpar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {metricsQuery.isLoading ? (
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
      ) : metricsQuery.data ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Leads por etapa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(metricsQuery.data.leads_per_stage).map(([stage, value]) => (
                  <div key={stage} className="flex items-center justify-between text-sm">
                    <span>{stage}</span>
                    <Badge variant="secondary">{value}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Taxa de conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-foreground">
                  {metricsQuery.data.conversion_rate_pct.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">{'Até a etapa "Fechamento"'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Tempo médio no funil</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-foreground">
                  {metricsQuery.data.avg_time_days.toFixed(1)} dias
                </p>
                <p className="text-xs text-muted-foreground">Entre criação e hoje</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por etapa</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="stage" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Area type="monotone" dataKey="value" stroke="#4ade80" fill="#4ade80" fillOpacity={0.25} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tabela detalhada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-muted-foreground">
                      <th className="pb-2">Etapa</th>
                      <th className="pb-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(metricsQuery.data.leads_per_stage).map(([stage, value]) => (
                      <tr key={stage} className="border-t text-sm">
                        <td className="py-2">{stage}</td>
                        <td className="py-2">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhuma métrica disponível.</p>
      )}
    </div>
  );
}
