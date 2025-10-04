"use client";

import { useTranslation } from "@/contexts/i18n-context";
import { SettingsPipelinesList } from "@/components/pipeline/settings-pipelines-list";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { messages } = useTranslation();
  const { crm } = messages;
  const tabs = crm.settings.tabs;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">{crm.settings.pipelines.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{crm.settings.pipelines.subtitle}</p>
      </div>

      <div className="border-b border-border">
        <nav className="flex gap-2">
          <TabButton active>{tabs.pipelines}</TabButton>
          <TabButton disabled>{tabs.users}</TabButton>
          <TabButton disabled>{tabs.preferences}</TabButton>
        </nav>
      </div>

      <SettingsPipelinesList />
    </div>
  );
}

type TabButtonProps = {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
};

function TabButton({ children, active, disabled }: TabButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
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
