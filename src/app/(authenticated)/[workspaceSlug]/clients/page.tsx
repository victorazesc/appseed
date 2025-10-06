"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api-client";
import type { LeadSummary } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/contexts/i18n-context";
import { useActivePipeline, usePipelines } from "@/contexts/pipeline-context";
import { useWorkspace } from "@/contexts/workspace-context";

const buildKey = (workspaceSlug: string | undefined, query: string, pipelineId?: string) =>
  ["clients", workspaceSlug ?? "unknown", query, pipelineId] as const;

export default function ClientsPage() {
  const [query, setQuery] = useState("");
  const { messages, locale } = useTranslation();
  const { crm } = messages;
  const { pipelines, isLoading: isPipelinesLoading } = usePipelines();
  const { activePipelineId } = useActivePipeline();
  const { workspace, isLoading: isWorkspaceLoading } = useWorkspace();
  const workspaceSlug = workspace?.slug;

  const leadsQuery = useQuery({
    queryKey: buildKey(workspaceSlug, query, activePipelineId ?? undefined),
    queryFn: async () => {
      if (!activePipelineId || !workspaceSlug) return [] as LeadSummary[];
      const params = new URLSearchParams();
      params.set("pipelineId", activePipelineId);
      params.set("limit", "200");
      params.set("workspaceSlug", workspaceSlug);
      if (query) params.set("q", query);
      const data = await apiFetch<{ leads: LeadSummary[] }>(`/api/leads?${params.toString()}`);
      return data.leads;
    },
    enabled: Boolean(activePipelineId && workspaceSlug),
    onError: (error: Error) => toast.error(error.message),
  });

  const leads = useMemo(() => leadsQuery.data ?? [], [leadsQuery.data]);

  const summary = useMemo(() => {
    const totalValue = leads.reduce((sum, lead) => sum + (lead.valueCents ?? 0), 0);
    const overdueCount = leads.filter((lead) => lead.hasOverdueTasks).length;
    const gainCount = leads.filter((lead) => lead.stage?.name === "Ganho").length;
    const lossCount = leads.filter((lead) => lead.stage?.name === "Perda").length;

    return {
      total: leads.length,
      totalValue,
      overdueCount,
      gainCount,
      lossCount,
    };
  }, [leads]);

  const hasPipelines = pipelines.length > 0;

  if (!workspaceSlug) {
    if (isWorkspaceLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
        Selecione um workspace para visualizar seus clientes.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{crm.clients.title}</h1>
          <p className="text-sm text-muted-foreground">{crm.clients.subtitle}</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={crm.placeholders.searchClients}
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={!hasPipelines}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{crm.clients.summary.total}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {summary.total}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{crm.clients.summary.value}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {formatCurrency(summary.totalValue, { locale })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{crm.clients.summary.overdue}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {summary.overdueCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">{crm.clients.summary.results}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Badge variant="success">{crm.clients.summary.gain} {summary.gainCount}</Badge>
            <Badge variant="destructive">{crm.clients.summary.loss} {summary.lossCount}</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {isPipelinesLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : !hasPipelines ? (
            <div className="p-6 text-sm text-muted-foreground">{crm.dashboard.emptyPipelines.description}</div>
          ) : leadsQuery.isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">{crm.clients.empty}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">{crm.clients.table.customer}</th>
                    <th className="px-4 py-3 text-left">{crm.clients.table.company}</th>
                    <th className="px-4 py-3 text-left">{crm.clients.table.stage}</th>
                    <th className="px-4 py-3 text-left">{crm.clients.table.value}</th>
                    <th className="px-4 py-3 text-left">{crm.clients.table.status}</th>
                    <th className="px-4 py-3 text-left">{crm.clients.table.owner}</th>
                    <th className="px-4 py-3 text-left">{crm.clients.table.createdAt}</th>
                    <th className="px-4 py-3 text-left sr-only">{crm.clients.table.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const createdAt = lead.createdAt ? formatDate(lead.createdAt, { locale }) : "—";
                    const statusBadge = lead.hasOverdueTasks
                      ? { label: crm.clients.statuses.overdue, variant: "destructive" as const }
                      : lead.nextDueAt
                        ? { label: crm.clients.statuses.inProgress, variant: "secondary" as const }
                        : { label: crm.clients.statuses.noTasks, variant: "outline" as const };

                    return (
                      <tr
                        key={lead.id}
                        className="border-b last:border-b-0 transition hover:bg-muted/40"
                      >
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{lead.name}</span>
                            <span className="text-xs text-muted-foreground">{lead.email ?? crm.clients.table.noEmail}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{lead.company ?? "—"}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{lead.stage?.name ?? crm.clients.table.noStage}</Badge>
                        </td>
                        <td className="px-4 py-3">{formatCurrency(lead.valueCents, { locale })}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{lead.ownerId ?? crm.clients.table.noOwner}</td>
                        <td className="px-4 py-3 text-muted-foreground">{createdAt}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={workspaceSlug ? `/${workspaceSlug}/leads/${lead.id}` : `/leads/${lead.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {crm.clients.table.details}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
