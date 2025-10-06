"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { KanbanSquare, Users, ChartArea } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { NotificationsMenu } from "@/components/notifications-menu";
import { apiFetch } from "@/lib/api-client";
import type { LeadSummary } from "@/types";
import type { GlobalRole } from "@prisma/client";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useTranslation } from "@/contexts/i18n-context";
import { NewPipelineDialog } from "@/components/pipeline/new-pipeline-dialog";
import { useActivePipeline } from "@/contexts/pipeline-context";
import { useWorkspace } from "@/contexts/workspace-context";

const NAV_LINKS = [
  { key: "funnel", url: "/dashboard", icon: KanbanSquare },
  { key: "clients", url: "/clients", icon: Users },
  { key: "metrics", url: "/metrics", icon: ChartArea },
] as const;

type AppShellProps = {
  children: React.ReactNode;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    globalRole?: GlobalRole;
    isAdminGlobal?: boolean;
    impersonatedWorkspaceId?: string | null;
  } | null;
};

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const { messages } = useTranslation();
  const { common } = messages;
  const { activePipeline } = useActivePipeline();
  const { workspace } = useWorkspace();
  const [pipelineDialogOpen, setPipelineDialogOpen] = useState(false);
  const [pipelineToEdit, setPipelineToEdit] = useState<typeof activePipeline | null | undefined>(undefined);

  const navLabels = messages.appShell.navLinks;

  const workspaceSlug = workspace?.slug;

  const navItems = useMemo(
    () => {
      const basePath = workspaceSlug ? `/${workspaceSlug}` : "";
      return NAV_LINKS.map((item) => {
        const url = `${basePath}${item.url}`;
        return {
          ...item,
          url,
          title: navLabels[item.key],
          isActive: pathname === url,
        };
      });
    },
    [workspaceSlug, pathname, navLabels],
  );

  const { data: notificationLeads } = useQuery({
    queryKey: ["notifications", workspaceSlug ?? "unknown", user?.email ?? "anonymous"],
    queryFn: async () => {
      if (!user || !workspaceSlug) return [] as LeadSummary[];
      const params = new URLSearchParams({ limit: "100", workspaceSlug });
      const data = await apiFetch<{ leads: LeadSummary[] }>(`/api/leads?${params.toString()}`);
      return data.leads;
    },
    enabled: Boolean(user && workspaceSlug),
    staleTime: 1000 * 30,
    onError: (error: Error) => {
      console.error("notifications fetch", error);
      toast.error(error.message);
    },
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
          onCreatePipeline={handleCreatePipeline}
          onEditPipeline={handleEditPipeline}
        />
        <SidebarInset className="flex flex-1 flex-col">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
              <div className="flex flex-1 items-center justify-between">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="hidden text-base font-semibold text-foreground sm:inline">
                    {navItems.find((item) => item.isActive)?.title ?? messages.appShell.defaultTitle}
                  </span>
                </div>
              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    <NotificationsMenu leads={notificationLeads} />
                    <UserMenu user={user} />
                  </>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/auth/sign-in">{common.actions.signIn}</Link>
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
