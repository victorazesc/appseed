"use client";

import { useState } from "react";
import { MoreHorizontal, PenLine, Trash2, Copy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { usePipelines, useActivePipeline } from "@/contexts/pipeline-context";
import { useTranslation } from "@/contexts/i18n-context";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import type { Pipeline } from "@/types";
import { NewPipelineDialog } from "./new-pipeline-dialog";
import { format as formatDate } from "date-fns";

function formatPipelineDate(date?: string) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  try {
    return formatDate(parsed, "dd/MM/yyyy");
  } catch {
    return "—";
  }
}

export function SettingsPipelinesList() {
  const { pipelines, isLoading, refetch } = usePipelines();
  const { activePipeline, setActivePipelineId } = useActivePipeline();
  const { messages } = useTranslation();
  const crm = messages.crm;
  const pipelineCopy = crm.pipelineModal;
  const settingsCopy = crm.settings.pipelines;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | undefined>(undefined);

  const handleEdit = (pipeline: Pipeline) => {
    setEditingPipeline(pipeline);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPipeline(undefined);
    setDialogOpen(true);
  };

  const handleDuplicate = async (pipeline: Pipeline) => {
    try {
      const response = await apiFetch<{ pipeline: Pipeline }>(`/api/pipelines/${pipeline.id}/duplicate`, {
        method: "POST",
      });
      await refetch();
      if (response.pipeline?.id) {
        setActivePipelineId(response.pipeline.id);
      }
      toast.success(pipelineCopy.created ?? "Funil duplicado");
    } catch (err) {
      console.error("duplicate pipeline", err);
      toast.error(pipelineCopy.error ?? "Não foi possível duplicar o funil");
    }
  };

  const handleDelete = async (pipeline: Pipeline) => {
    const confirmation = window.confirm(settingsCopy.deleteConfirm);
    if (!confirmation) return;

    try {
      await apiFetch(`/api/pipelines/${pipeline.id}`, {
        method: "DELETE",
      });
      await refetch();
      if (activePipeline?.id === pipeline.id) {
        const fallback = pipelines.find((item) => item.id !== pipeline.id);
        if (fallback) {
          setActivePipelineId(fallback.id);
        }
      }
      toast.success(settingsCopy.deleted);
    } catch (err) {
      console.error("delete pipeline", err);
      toast.error(pipelineCopy.error ?? "Não foi possível remover o funil");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{settingsCopy.title}</CardTitle>
        <Button size="sm" onClick={handleCreate}>
          {crm.pipelineSwitcher.create}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : pipelines.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
            {settingsCopy.empty}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Cor</th>
                  <th className="px-4 py-3">Etapas</th>
                  <th className="px-4 py-3">Leads</th>
                  <th className="px-4 py-3">Criado em</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pipelines.map((pipeline) => (
                  <tr key={pipeline.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium text-foreground">{pipeline.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex h-3 w-3 rounded-full"
                        style={{ backgroundColor: pipeline.color }}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {pipeline._count?.stages ?? pipeline.stages?.length ?? 0}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {pipeline._count?.leads ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatPipelineDate(pipeline.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>{pipeline.name}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => handleEdit(pipeline)} className="flex items-center gap-2">
                            <PenLine className="h-4 w-4" /> {crm.pipelineSwitcher.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleDuplicate(pipeline)} className="flex items-center gap-2">
                            <Copy className="h-4 w-4" /> Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => handleDelete(pipeline)}
                            className="flex items-center gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      <NewPipelineDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        pipeline={editingPipeline ?? undefined}
      />
    </Card>
  );
}
