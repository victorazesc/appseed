"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  KanbanSquare,
  Users,
  ChartArea,
  Plug,
  UserRound,
  LifeBuoy,
  Send,
  Plus,
} from "lucide-react";

import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";
import { useTranslation } from "@/contexts/i18n-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { WorkspaceSidebarSwitcher } from "@/components/workspace/sidebar-workspace-switcher";
import { SidebarPipelineSwitcher } from "@/components/pipeline/sidebar-pipeline-switcher";
import { SidebarUserMenu } from "@/components/sidebar-user-menu";
import { Button } from "@/components/ui/button";

const DEFAULT_NAV = [
  { key: "funnel", url: "/dashboard", icon: KanbanSquare },
  { key: "clients", url: "/clients", icon: Users },
  { key: "metrics", url: "/metrics", icon: ChartArea },
] as const;

type NavItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  navItems?: NavItem[];
  user?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
  onCreatePipeline?: () => void;
  onEditPipeline?: () => void;
};

export function AppSidebar({
  navItems = [],
  user,
  onCreatePipeline,
  onEditPipeline,
  ...props
}: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { messages } = useTranslation();
  const { workspace } = useWorkspace();
  const workspaceSlug = workspace?.slug;
  const fallbackWorkspaceHref = "/auth/post-login";
  const buildWorkspaceUrl = useCallback(
    (path: string) => (workspaceSlug ? `/${workspaceSlug}${path}` : fallbackWorkspaceHref),
    [workspaceSlug],
  );
  const homeHref = buildWorkspaceUrl("/dashboard");

  const defaultItems = useMemo(
    () =>
      DEFAULT_NAV.map((item) => ({
        title: messages.appShell.navLinks[item.key],
        url: buildWorkspaceUrl(item.url),
        icon: item.icon,
      })),
    [messages.appShell.navLinks, buildWorkspaceUrl],
  );

  const generalItems = navItems.length ? navItems : defaultItems;

  const managementItems: NavItem[] = [
    {
      title: "Integrações",
      url: buildWorkspaceUrl("/integrations"),
      icon: Plug,
    },
    {
      title: "Membros",
      url: `${buildWorkspaceUrl("/settings")}?section=members`,
      icon: UserRound,
    },
  ];

  const supportItems: NavItem[] = [
    {
      title: "Suporte",
      url: "mailto:contato@appseed.com.br",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "mailto:produto@appseed.com.br",
      icon: Send,
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <div className="flex h-full flex-col">
        <header className="border-b border-border/60 px-5 pb-5 pt-6">
          <div className="flex items-center gap-3">
            <a href={homeHref} className="flex items-center gap-2">
              <Logo className="!h-6 !w-auto" />
            </a>
            <WorkspaceSidebarSwitcher />
          </div>

          <div className="mt-4">
            <SidebarPipelineSwitcher onCreate={onCreatePipeline} onEdit={onEditPipeline} />
          </div>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
          <SidebarSection title="Geral" items={generalItems} currentPath={pathname} />
          <SidebarSection title="Gestão" items={managementItems} currentPath={pathname} />
          <SidebarSection title="Suporte" items={supportItems} currentPath={pathname} />
        </div>

        <footer className="border-t border-border/60 px-5 py-5">
          <SidebarUserMenu user={user} />
        </footer>
      </div>
    </Sidebar>
  );
}

function SidebarSection({
  title,
  items,
  currentPath,
}: {
  title: string;
  items: NavItem[];
  currentPath: string;
}) {
  if (!items.length) return null;

  return (
    <div className="space-y-3">
      <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
        {title}
      </p>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon ?? KanbanSquare;
          const isActive = item.isActive ?? currentPath === item.url;
          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className="group data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
              >
                <Link href={item.url} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm">
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </div>
  );
}
