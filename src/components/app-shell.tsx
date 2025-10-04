"use client";

import { useMemo, useState } from "react";
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
import { useTranslation } from "@/contexts/i18n-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { PipelineSwitcher } from "@/components/pipeline/pipeline-switcher";
import { NewPipelineDialog } from "@/components/pipeline/new-pipeline-dialog";
import { useActivePipeline } from "@/contexts/pipeline-context";

const NAV_LINKS = [
  { key: "funnel", url: "/dashboard", icon: KanbanSquare },
  { key: "clients", url: "/clients", icon: Users },
  { key: "metrics", url: "/metrics", icon: ChartArea },
] as const;

type AppShellProps = {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const { messages } = useTranslation();
  const { common } = messages;
  const pipelineCopy = messages.crm.pipelineSwitcher;
  const { activePipeline } = useActivePipeline();
  const [pipelineDialogOpen, setPipelineDialogOpen] = useState(false);
  const [pipelineToEdit, setPipelineToEdit] = useState<typeof activePipeline | null | undefined>(undefined);

  const navLabels = messages.appShell.navLinks;

  const navItems = useMemo(
    () =>
      NAV_LINKS.map((item) => ({
        ...item,
        title: navLabels[item.key],
        isActive: pathname === item.url,
      })),
    [pathname, navLabels],
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

  const handleCreatePipeline = () => {
    setPipelineToEdit(undefined);
    setPipelineDialogOpen(true);
  };

  const handleEditPipeline = () => {
    if (!activePipeline) return;
    setPipelineToEdit(activePipeline);
    setPipelineDialogOpen(true);
  };

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
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="hidden text-base font-semibold text-foreground sm:inline">
                  {navItems.find((item) => item.isActive)?.title ?? messages.appShell.defaultTitle}
                </span>
                <PipelineSwitcher
                  onCreatePipeline={handleCreatePipeline}
                  onEditPipeline={handleEditPipeline}
                />
                <Button size="sm" onClick={handleCreatePipeline} className="hidden md:inline-flex">
                  {pipelineCopy.create}
                </Button>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <LanguageSwitcher className="hidden md:flex" />
                <ThemeToggle className="hidden md:flex" />
                <div className="flex items-center gap-2 md:hidden">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
                {user ? (
                  <>
                    <NotificationsMenu leads={notificationLeads} />
                    <UserMenu user={user} />
                  </>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/signin">{common.actions.signIn}</Link>
                  </Button>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-muted/30 px-4 py-6 md:px-8">
            <div className="mx-auto w-full space-y-6">{children}</div>
          </main>
        </SidebarInset>
        <NewPipelineDialog
          open={pipelineDialogOpen}
          onOpenChange={setPipelineDialogOpen}
        pipeline={pipelineToEdit ?? undefined}
      />
      </div>
    </SidebarProvider>
  );
}
