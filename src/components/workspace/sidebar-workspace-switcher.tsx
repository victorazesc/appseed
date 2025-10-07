"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Circle } from "lucide-react";

import { useWorkspace } from "@/contexts/workspace-context";
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

export function WorkspaceSidebarSwitcher() {
  const router = useRouter();
  const { workspace, memberships, setActiveWorkspace, role, impersonated } = useWorkspace();

  const activeSlug = workspace?.slug;

  const activeColor = workspace?.color ?? "#22c55e";
  const buttonLabel = workspace?.name ?? "Selecionar workspace";
  const items = useMemo(() => memberships ?? [], [memberships]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-10 flex-1 items-center justify-between rounded-lg bg-transparent px-2 text-left transition hover:bg-muted/60 focus:outline-none">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">{buttonLabel}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">
          Seus workspaces
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <DropdownMenuItem disabled>Nenhum workspace disponível</DropdownMenuItem>
        ) : null}
        {items.map((item) => {
          const isActive = item.slug === activeSlug;
          return (
            <DropdownMenuItem
              key={item.id}
              className="flex items-start gap-2"
              onSelect={() => setActiveWorkspace(item.slug)}
            >
              <span className="mt-1">
                {isActive ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Circle className="h-3 w-3 text-muted-foreground" />
                )}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.slug}</span>
              </span>
              <Badge variant="outline" className="ml-auto text-[10px] uppercase">
                {ROLE_LABEL[item.role ?? ""] ?? item.role ?? "Member"}
              </Badge>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
       <DropdownMenuItem onSelect={() => router.push("/onboarding/create-workspace")}>
          Criar novo workspace
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            router.push(
              activeSlug
                ? `/${activeSlug}/settings?section=members`
                : "/auth/post-login?section=members",
            )
          }
        >
          Convites e membros
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          Papel atual: {ROLE_LABEL[role ?? ""] ?? role ?? "Viewer"}
        </DropdownMenuItem>
        {impersonated ? (
          <DropdownMenuItem disabled className="text-xs text-amber-500">
            Sessão de impersonação ativa
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
