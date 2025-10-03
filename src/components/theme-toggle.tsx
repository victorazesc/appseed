"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/theme-context";
import { useTranslation } from "@/contexts/i18n-context";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { messages } = useTranslation();

  const isDark = theme === "dark";
  const label = isDark ? messages.common.themeToggle.light : messages.common.themeToggle.dark;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={toggleTheme}
        aria-label={messages.common.themeToggle.ariaLabel}
        title={label}
        className="h-10 w-10 border-border bg-background text-foreground shadow-none"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <span className="hidden text-sm font-medium text-muted-foreground sm:inline">{label}</span>
    </div>
  );
}
