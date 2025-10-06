"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { useWorkspace } from "@/contexts/workspace-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

export function WorkspaceSwitcher() {
  const router = useRouter();
  const { memberships, workspace, role, impersonated, setActiveWorkspace, isLoading } = useWorkspace();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);

  const handleNewWorkspace = useCallback(() => {
    router.push("/onboarding/create-workspace");
  }, [router]);

  useEffect(() => {
    if (!pendingSlug) return;
    if (workspace?.slug === pendingSlug) {
      setPendingSlug(null);
    }
  }, [pendingSlug, workspace?.slug]);

  const isSwitching = Boolean(pendingSlug && pendingSlug !== workspace?.slug);
  const triggerDisabled = isLoading || isSwitching;

  const workspaceButtonLabel = isLoading && !workspace ? "Carregando workspaces..." : workspace?.name ?? "Selecionar workspace";

  const handleSelect = useCallback(
    (slug: string) => {
      setPendingSlug(slug);
      setActiveWorkspace(slug);
    },
    [setActiveWorkspace],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="inline-flex items-center gap-2"
          disabled={triggerDisabled}
        >
          <span className="inline-flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: workspace?.color ?? "#16A34A" }}
            />
            <span className="text-sm font-medium text-foreground">
              {workspaceButtonLabel}
            </span>
            {role ? (
              <Badge variant="outline" className="text-[10px] uppercase">
                {ROLE_LABEL[role] ?? role}
              </Badge>
            ) : null}
            {impersonated ? (
              <Badge variant="secondary" className="text-[10px] uppercase">
                Impersonado
              </Badge>
            ) : null}
          </span>
          {triggerDisabled ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : (
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <DropdownMenuItem disabled>Carregando…</DropdownMenuItem>
        ) : null}
        {!isLoading && memberships.length === 0 ? (
          <DropdownMenuItem disabled>Nenhum workspace disponível</DropdownMenuItem>
        ) : null}
        {memberships.map((membership) => {
          const isActive = membership.slug === workspace?.slug;
          const isPending = membership.slug === pendingSlug;
          return (
            <DropdownMenuItem
              key={membership.id}
              className="flex items-start gap-2"
              onSelect={() => handleSelect(membership.slug)}
              disabled={triggerDisabled || isPending}
            >
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: membership.color ?? "#16A34A" }}
                  />
                  {membership.name}
                  {isActive ? <Check className="h-3.5 w-3.5 text-primary" /> : null}
                </span>
                <span className="text-xs text-muted-foreground">{membership.slug}</span>
              </div>
              <Badge variant="outline" className="ml-auto text-[10px] uppercase">
                {ROLE_LABEL[membership.role as keyof typeof ROLE_LABEL] ?? membership.role}
              </Badge>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleNewWorkspace} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Novo workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
