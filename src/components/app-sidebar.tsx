"use client";

import * as React from "react";
import { KanbanSquare, Users, ChartArea } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";

const defaultNav = [
  { title: "Funil", url: "/dashboard", icon: KanbanSquare },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Métricas", url: "/metrics", icon: ChartArea },
];

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

export function AppSidebar({ navItems = defaultNav, user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/dashboard" className="flex items-center gap-2">
                <Logo className="!h-5 !w-auto" />
                <span className="text-base font-semibold">AppSeed CRM</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      {/* {user ? (
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      ) : null} */}
    </Sidebar>
  );
}
