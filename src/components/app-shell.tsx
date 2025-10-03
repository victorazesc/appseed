"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { KanbanSquare, Users, ChartArea } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { NotificationsMenu } from "@/components/notifications-menu";
import { apiFetch } from "@/lib/api-client";
import type { LeadSummary } from "@/types";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const NAV_LINKS = [
  { title: "Funil", url: "/dashboard", icon: KanbanSquare },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Métricas", url: "/metrics", icon: ChartArea },
];

type AppShellProps = {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();

  const navItems = useMemo(
    () =>
      NAV_LINKS.map((item) => ({
        ...item,
        isActive: pathname === item.url,
      })),
    [pathname],
  );

  const { data: notificationLeads } = useQuery({
    queryKey: ["notifications", user?.email ?? "anonymous"],
    queryFn: async () => {
      if (!user) return [] as LeadSummary[];
      const data = await apiFetch<{ leads: LeadSummary[] }>("/api/leads?limit=100");
      return data.leads;
    },
    enabled: Boolean(user),
    staleTime: 1000 * 30,
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        <AppSidebar
          navItems={navItems}
          user={user ? { name: user.name, email: user.email, avatarUrl: undefined } : null}
        />
        <SidebarInset className="flex flex-1 flex-col">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="hidden text-base font-semibold text-foreground sm:inline">
                  {navItems.find((item) => item.isActive)?.title ?? "Painel"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {user ? (
                  <>
                    <NotificationsMenu leads={notificationLeads} />
                    <UserMenu user={user} />
                  </>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/signin">Entrar</Link>
                  </Button>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-muted/30 px-4 py-6 md:px-8">
            <div className="mx-auto w-full space-y-6">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
