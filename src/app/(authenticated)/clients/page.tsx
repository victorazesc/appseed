"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { apiFetch } from "@/lib/api-client";
import type { LeadSummary } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsPage() {
  const [query, setQuery] = useState("");

  const leadsQuery = useQuery({
    queryKey: ["clients", query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      params.set("limit", "200");
      const data = await apiFetch<{ leads: LeadSummary[] }>(`/api/leads?${params.toString()}`);
      return data.leads;
    },
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clientes e Leads</h1>
          <p className="text-sm text-muted-foreground">
            Visualize todos os contatos cadastrados, status no funil e próximos passos.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email"
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total de registros</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {summary.total}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Valor potencial</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {formatCurrency(summary.totalValue)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tarefas em atraso</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {summary.overdueCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Resultados</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Badge variant="success">Ganho {summary.gainCount}</Badge>
            <Badge variant="destructive">Perda {summary.lossCount}</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {leadsQuery.isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Nenhum cliente encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-left">Empresa</th>
                    <th className="px-4 py-3 text-left">Etapa</th>
                    <th className="px-4 py-3 text-left">Valor</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Responsável</th>
                    <th className="px-4 py-3 text-left">Criado em</th>
                    <th className="px-4 py-3 text-left sr-only">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const createdAt = lead.createdAt ? formatDate(lead.createdAt) : "—";
                    const statusBadge = lead.hasOverdueTasks
                      ? { label: "Atrasado", variant: "destructive" as const }
                      : lead.nextDueAt
                        ? { label: "Em andamento", variant: "secondary" as const }
                        : { label: "Sem tarefas", variant: "outline" as const };

                    return (
                      <tr
                        key={lead.id}
                        className="border-b last:border-b-0 transition hover:bg-muted/40"
                      >
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{lead.name}</span>
                            <span className="text-xs text-muted-foreground">{lead.email ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{lead.company ?? "—"}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{lead.stage?.name ?? "Sem etapa"}</Badge>
                        </td>
                        <td className="px-4 py-3">{formatCurrency(lead.valueCents)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{lead.ownerId ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{createdAt}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            Detalhes
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
