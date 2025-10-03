"use client";

import * as React from "react";
import { KanbanSquare, Users, ChartArea } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";
import { useTranslation } from "@/contexts/i18n-context";

const DEFAULT_NAV = [
  { key: "funnel", url: "/dashboard", icon: KanbanSquare },
  { key: "clients", url: "/clients", icon: Users },
  { key: "metrics", url: "/metrics", icon: ChartArea },
] as const;

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  navItems?: Array<{
    title: string;
    url: string;
    icon?: typeof KanbanSquare;
    isActive?: boolean;
  }>;
  user?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
};

export function AppSidebar({ navItems = [], user: _user, ...props }: AppSidebarProps) {
  const { messages } = useTranslation();
  const defaultItems = React.useMemo(
    () =>
      DEFAULT_NAV.map((item) => ({
        title: messages.appShell.navLinks[item.key],
        url: item.url,
        icon: item.icon,
      })),
    [messages.appShell.navLinks],
  );

  const resolvedNavItems = navItems.length ? navItems : defaultItems;
  void _user;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/dashboard" className="flex items-center gap-2">
                <Logo className="!h-5 !w-auto" />
                <span className="text-base font-semibold">{messages.crm.sidebar.productName}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={resolvedNavItems} />
      </SidebarContent>
    </Sidebar>
  );
}
