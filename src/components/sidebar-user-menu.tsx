"use client";

import { signOut } from "next-auth/react";
import { CheckSquare, ChevronDown, LogOut, Settings2, UserRound } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type SidebarUserMenuProps = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
};

export function SidebarUserMenu({ user }: SidebarUserMenuProps) {
  const { workspace } = useWorkspace();
  if (!user) return null;
  const workspaceSlug = workspace?.slug;
  const settingsHref = workspaceSlug ? `/${workspaceSlug}/settings` : "/auth/post-login";
  const profileHref = workspaceSlug ? `/${workspaceSlug}/settings?section=preferences` : settingsHref;
  const activitiesHref = workspaceSlug ? `/${workspaceSlug}/activities` : "/auth/post-login";

  const initials =
    user.name?.split(" ")?.map((part) => part[0])?.join("")?.slice(0, 2)?.toUpperCase() ?? "US";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left transition hover:border-primary/50 focus:outline-none overflow-hidden">
        <div className="flex items-center gap-3 w-full overflow-hidden">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Usuário"} />
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
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
        {workspaceSlug ? (
          <DropdownMenuItem asChild>
            <Link href={activitiesHref} className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" /> Minhas atividades
            </Link>
          </DropdownMenuItem>
        ) : null}
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
