"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useTranslation } from "@/contexts/i18n-context";
import { SettingsPipelinesList } from "@/components/pipeline/settings-pipelines-list";
import { WorkspaceMembersSection } from "@/components/workspace/settings-members-section";
import { cn } from "@/lib/utils";
import { WorkspacePreferencesSection } from "@/components/workspace/settings-preferences-section";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const { messages } = useTranslation();
  const { crm } = messages;
  const tabs = crm.settings.tabs;
  const [activeTab, setActiveTab] = useState<"pipelines" | "members" | "preferences">("pipelines");

  const requestedTab = useMemo(() => {
    const param = searchParams?.get("section");
    if (param === "members") return "members";
    if (param === "preferences") return "preferences";
    return "pipelines";
  }, [searchParams]);

  useEffect(() => {
    setActiveTab(requestedTab);
  }, [requestedTab]);

  const headerCopy = activeTab === "members"
    ? {
        title: crm.settings.members.title,
        subtitle: crm.settings.members.subtitle,
      }
    : activeTab === "preferences"
      ? {
          title: crm.settings.preferences.title,
          subtitle: crm.settings.preferences.subtitle,
        }
      : {
          title: crm.settings.pipelines.title,
          subtitle: crm.settings.pipelines.subtitle,
        };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">{headerCopy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{headerCopy.subtitle}</p>
      </div>

      <div className="border-b border-border">
        <nav className="flex gap-2">
          <TabButton active={activeTab === "pipelines"} onClick={() => setActiveTab("pipelines")}>
            {tabs.pipelines}
          </TabButton>
          <TabButton active={activeTab === "members"} onClick={() => setActiveTab("members")}>
            {tabs.users}
          </TabButton>
          <TabButton active={activeTab === "preferences"} onClick={() => setActiveTab("preferences")}>
            {tabs.preferences}
          </TabButton>
        </nav>
      </div>

      {activeTab === "pipelines" ? <SettingsPipelinesList /> : null}
      {activeTab === "members" ? <WorkspaceMembersSection /> : null}
      {activeTab === "preferences" ? <WorkspacePreferencesSection /> : null}
    </div>
  );
}

type TabButtonProps = {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

function TabButton({ children, active, disabled, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={cn(
        "px-3 py-2 text-sm font-medium transition",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {children}
    </button>
  );
}
