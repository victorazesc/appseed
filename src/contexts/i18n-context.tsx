"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { languageToLocale, translations, type Language, type TranslationContent } from "@/i18n/translations";

const LANGUAGE_STORAGE_KEY = "appseed:language";

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  messages: TranslationContent;
  locale: string;
  t: (key: string) => unknown;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function getNestedValue(target: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, target);
}

function isLanguage(value: string | null): value is Language {
  return value === "pt" || value === "en" || value === "es";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(stored)) {
      setLanguageState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextLocale = languageToLocale[language];
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = nextLocale;
  }, [language]);

  const handleSetLanguage = useCallback((value: Language) => {
    setLanguageState(value);
  }, []);

  const messages = useMemo(() => translations[language], [language]);
  const locale = languageToLocale[language];

  const t = useCallback(
    (key: string) => {
      const result = getNestedValue(messages as Record<string, unknown>, key);
      return result ?? key;
    },
    [messages],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage: handleSetLanguage,
      messages,
      locale,
      t,
    }),
    [language, handleSetLanguage, messages, locale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}
