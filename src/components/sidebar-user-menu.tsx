"use client";

import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, Settings2, UserRound } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/contexts/workspace-context";

type SidebarUserMenuProps = {
  user?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
};

export function SidebarUserMenu({ user }: SidebarUserMenuProps) {
  const { workspace } = useWorkspace();
  if (!user) return null;
  const workspaceSlug = workspace?.slug;
  const settingsHref = workspaceSlug ? `/${workspaceSlug}/settings` : "/auth/post-login";
  const profileHref = workspaceSlug ? `/${workspaceSlug}/settings?section=preferences` : settingsHref;

  const initials =
    user.name?.split(" ")?.map((part) => part[0])?.join("")?.slice(0, 2)?.toUpperCase() ?? "US";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left transition hover:border-primary/50 focus:outline-none">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {initials}
          </span>
          <span className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-foreground">{user.name ?? "Usuário"}</span>
            <span className="text-xs text-muted-foreground truncate overflow-hidden">{user.email ?? "sem email"}</span>
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">Conta</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={profileHref} className="flex items-center gap-2">
            <UserRound className="h-4 w-4" /> Ver Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={settingsHref} className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" /> Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 text-destructive focus:text-destructive"
          onSelect={(event) => {
            event.preventDefault();
            void signOut({ callbackUrl: "/auth/sign-in" });
          }}
        >
          <LogOut className="h-4 w-4" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
