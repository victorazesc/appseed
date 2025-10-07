"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type UserMenuProps = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
};

export function UserMenu({ user }: UserMenuProps) {
  if (!user) {
    return null;
  }

  const initials = user.name?.split(" ")?.map((part) => part[0])?.join("")?.slice(0, 2) ?? "SF";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group inline-flex items-center gap-2 rounded-full border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Usuário"} />
          <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden flex-col text-left leading-tight sm:flex">
          <span className="text-sm font-semibold text-foreground">{user.name ?? "Usuário"}</span>
          <span className="text-xs text-muted-foreground">{user.email ?? "Sem email"}</span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800" forceMount>
        <DropdownMenuLabel className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Usuário"} />
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
          <span>
            <span className="block text-sm font-semibold text-foreground">{user.name ?? "Usuário"}</span>
            <span className="block text-xs text-muted-foreground">{user.email ?? "Sem email"}</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={cn("gap-2 text-sm text-destructive focus:text-destructive")}
          onSelect={(event) => {
            event.preventDefault();
            void signOut({ callbackUrl: "/auth/sign-in" });
          }}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
