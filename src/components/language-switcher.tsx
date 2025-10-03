"use client";

import { Globe2 } from "lucide-react";
import { useMemo } from "react";

import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/i18n-context";
import type { Language } from "@/i18n/translations";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage, messages } = useTranslation();

  const languageLabel = messages.common.languageLabel;
  const languageOptions = useMemo(() => Object.entries(messages.common.languages) as Array<[Language, string]>, [messages.common.languages]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Globe2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        aria-label={languageLabel}
        className={"h-10 w-32 rounded-lg border-border bg-background text-sm font-medium text-foreground shadow-none"}
      >
        {languageOptions.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
    </div>
  );
}
