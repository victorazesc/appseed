"use client";

import { useMemo } from "react";
import { ChevronDown, Plus, Pencil, Settings2 } from "lucide-react";
import Link from "next/link";

import { usePipelines, useActivePipeline } from "@/contexts/pipeline-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { useTranslation } from "@/contexts/i18n-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PLACEHOLDER_COLOR = "#22c55e";

type SidebarPipelineSwitcherProps = {
  onCreate?: () => void;
  onEdit?: () => void;
};

export function SidebarPipelineSwitcher({ onCreate, onEdit }: SidebarPipelineSwitcherProps) {
  const { pipelines, isLoading, isFetching, setActivePipelineId } = usePipelines();
  const { activePipeline } = useActivePipeline();
  const { workspace } = useWorkspace();
  const { messages } = useTranslation();
  const copy = messages.crm.pipelineSwitcher;

  const label = useMemo(() => copy.title ?? "Funil ativo", [copy.title]);
  const manageLabel = copy.manage ?? "Gerenciar";

  const handleSelect = (pipelineId: string) => {
    setActivePipelineId(pipelineId);
  };

  const workspaceSlug = workspace?.slug;
  const settingsHref = workspaceSlug ? `/${workspaceSlug}/settings` : "/settings";

  return (
    <div className="flex w-full items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 flex-1 items-center justify-between rounded-sm border-border bg-background px-4"
          >
            <span className="flex items-center gap-3">
              <span
                className="inline-flex h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: activePipeline?.color ?? PLACEHOLDER_COLOR }}
              />
              <span className="truncate text-xs font-medium text-foreground">
                {activePipeline?.name ?? label}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel className="flex items-center justify-between text-xs uppercase text-muted-foreground">
            {label}
            {isLoading || isFetching ? (
              <span className="text-[10px] text-muted-foreground/80">{copy.loading ?? "Atualizando"}</span>
            ) : null}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {pipelines.length === 0 ? (
            <DropdownMenuItem disabled>{copy.empty}</DropdownMenuItem>
          ) : (
            pipelines.map((pipeline) => (
              <DropdownMenuItem
                key={pipeline.id}
                onSelect={() => handleSelect(pipeline.id)}
                className="flex items-center gap-3"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: pipeline.color ?? PLACEHOLDER_COLOR }}
                />
                <span className="flex-1 truncate text-sm">{pipeline.name}</span>
                {pipeline.id === activePipeline?.id ? (
                  <span className="text-xs text-muted-foreground">{copy.active}</span>
                ) : null}
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> {copy.create}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onEdit} disabled={!activePipeline} className="flex items-center gap-2">
            <Pencil className="h-4 w-4" /> {copy.edit}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={settingsHref} className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" /> {manageLabel}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-8 w-8 rounded-sm"
        onClick={() => onCreate?.()}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
