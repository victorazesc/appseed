"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = "appseed:theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function applyTheme(theme: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.dataset.theme = theme;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const initialPreference: ThemePreference = isThemePreference(stored) ? stored : "system";
    const initialResolved = initialPreference === "system" ? getSystemTheme() : initialPreference;

    setThemeState(initialPreference);
    setResolvedTheme(initialResolved);
    applyTheme(initialResolved);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const resolved = theme === "system" ? getSystemTheme() : theme;
    setResolvedTheme(resolved);
    applyTheme(resolved);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined" || theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const next = getSystemTheme();
      setResolvedTheme(next);
      applyTheme(next);
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handler);
      return () => {
        media.removeEventListener("change", handler);
      };
    }

    media.addListener?.(handler);
    return () => {
      media.removeListener?.(handler);
    };
  }, [theme]);

  const setTheme = useCallback((value: ThemePreference) => {
    setThemeState(value);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
