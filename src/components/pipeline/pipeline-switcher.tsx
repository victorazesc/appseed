"use client";

import { useMemo } from "react";
import { ChevronDown, Palette, Plus, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActivePipeline, usePipelines } from "@/contexts/pipeline-context";
import { useTranslation } from "@/contexts/i18n-context";
import { useWorkspace } from "@/contexts/workspace-context";
import Link from "next/link";

type PipelineSwitcherProps = {
  onCreatePipeline?: () => void;
  onEditPipeline?: () => void;
};

export function PipelineSwitcher({ onCreatePipeline, onEditPipeline }: PipelineSwitcherProps) {
  const { pipelines, isLoading, isFetching, setActivePipelineId } = usePipelines();
  const { activePipeline } = useActivePipeline();
  const { messages } = useTranslation();
  const { workspace } = useWorkspace();

  const switcherCopy = messages.crm.pipelineSwitcher;
  const label = useMemo(() => switcherCopy.title ?? "Funil ativo", [switcherCopy]);
  const loadingLabel = switcherCopy.loading ?? "Atualizando";

  const handleSelectPipeline = (pipelineId: string) => {
    setActivePipelineId(pipelineId);
  };

  const pipelineItems = pipelines.map((pipeline) => (
    <DropdownMenuItem
      key={pipeline.id}
      onSelect={() => handleSelectPipeline(pipeline.id)}
      className="flex items-center justify-between gap-3"
    >
      <span className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pipeline.color }} />
        {pipeline.name}
      </span>
      {pipeline.id === activePipeline?.id ? (
        <span className="text-xs text-muted-foreground">{messages.crm.pipelineSwitcher.active}</span>
      ) : null}
    </DropdownMenuItem>
  ));

  const handleCreate = () => {
    onCreatePipeline?.();
  };

  const handleEdit = () => {
    if (!activePipeline) return;
    onEditPipeline?.();
  };

  const workspaceSlug = workspace?.slug;
  const settingsHref = workspaceSlug ? `/${workspaceSlug}/settings` : "/settings";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            {activePipeline ? (
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: activePipeline.color }}
                aria-hidden
              />
            ) : null}
            <span>{activePipeline?.name ?? label}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel className="flex items-center justify-between">
          {label}
          {isLoading || isFetching ? (
            <span className="text-xs text-muted-foreground">{loadingLabel}</span>
            ) : null}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {pipelineItems.length ? pipelineItems : (
            <DropdownMenuItem disabled>{switcherCopy.empty}</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {switcherCopy.create}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleEdit} disabled={!activePipeline} className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {switcherCopy.edit}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={settingsHref} className="flex w-full items-center gap-2">
              <Settings2 className="h-4 w-4" />
              {switcherCopy.manage}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
