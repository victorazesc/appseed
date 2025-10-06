"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, AlertTriangle, Clock, UserPlus } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LeadSummary } from "@/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/contexts/workspace-context";

type NotificationsMenuProps = {
  leads?: LeadSummary[];
};

type Notification = {
  id: string;
  leadId: string;
  title: string;
  description: string;
  href: string;
  createdAt: string;
  type: "new_lead" | "task_overdue" | "task_due_soon";
  icon: "bell" | "alert" | "clock";
  highlight: boolean;
};

const STORAGE_KEY = "appseed:last_seen_notifications";

export function NotificationsMenu({ leads }: NotificationsMenuProps) {
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(() => {
    if (typeof window === "undefined") return new Date(0).toISOString();
    return localStorage.getItem(STORAGE_KEY) ?? new Date(0).toISOString();
  });
  const { workspace } = useWorkspace();
  const workspaceSlug = workspace?.slug;

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, lastSeen);
  }, [lastSeen]);

  const notifications = useMemo<Notification[]>(() => {
    if (!leads?.length) return [];

    const now = Date.now();
    const lastSeenDate = new Date(lastSeen).getTime();

    return leads.flatMap<Notification>((lead) => {
      const items: Notification[] = [];
      const createdAt = lead.createdAt ? new Date(lead.createdAt).getTime() : 0;
      const nextDueAt = lead.nextDueAt ? new Date(lead.nextDueAt).getTime() : null;
      const hasOverdue = Boolean(lead.hasOverdueTasks && (lead.overdueTasksCount ?? 0) > 0);
      const dueSoon = Boolean(
        !hasOverdue && nextDueAt && nextDueAt > now && nextDueAt - now <= 60 * 60 * 1000,
      );
      const leadHref = workspaceSlug ? `/${workspaceSlug}/leads/${lead.id}` : `/leads/${lead.id}`;

      if (createdAt && createdAt > lastSeenDate) {
        items.push({
          id: `${lead.id}-new` + createdAt,
          leadId: lead.id,
          title: lead.name,
          description: "Novo lead cadastrado",
          href: leadHref,
          createdAt: lead.createdAt ?? new Date().toISOString(),
          type: "new_lead",
          icon: "bell",
          highlight: true,
        });
      }

      if (hasOverdue) {
        items.push({
          id: `${lead.id}-overdue`,
          leadId: lead.id,
          title: lead.name,
          description: `${lead.overdueTasksCount ?? 0} tarefa(s) atrasada(s)`,
          href: leadHref,
          createdAt: lead.createdAt ?? new Date().toISOString(),
          type: "task_overdue",
          icon: "alert",
          highlight: true,
        });
      }

      if (dueSoon && nextDueAt) {
        items.push({
          id: `${lead.id}-due-soon`,
          leadId: lead.id,
          title: lead.name,
          description: `Tarefa vence em ${formatDate(new Date(nextDueAt))}`,
          href: leadHref,
          createdAt: new Date(nextDueAt).toISOString(),
          type: "task_due_soon",
          icon: "clock",
          highlight: false,
        });
      }

      return items;
    });
  }, [leads, lastSeen, workspaceSlug]);

  const unreadCount = notifications.filter((notification) => notification.highlight).length;
  const hasAttention = notifications.some(
    (notification) => notification.type === "task_overdue" || notification.type === "task_due_soon",
  );

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setLastSeen(new Date().toISOString());
    }
  };

  const iconFor = (notification: Notification) => {
    switch (notification.type) {
      case "task_overdue":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "task_due_soon":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <UserPlus className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-input bg-background text-muted-foreground shadow-sm transition hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        <Bell className={cn("h-4 w-4", hasAttention && "text-amber-500")} />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-slate-800" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {notifications.length > 0 ? (
            <Badge variant="secondary">{notifications.length}</Badge>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            Nenhuma notificação.
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="whitespace-normal p-0">
              <Link
                href={notification.href}
                className="flex w-full items-start gap-3 px-3 py-2"
              >
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  {iconFor(notification)}
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="text-sm font-medium text-foreground">{notification.title}</span>
                  <span className="text-xs text-muted-foreground">{notification.description}</span>
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
