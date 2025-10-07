"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkspaceRole } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/contexts/workspace-context";
import { useTranslation } from "@/contexts/i18n-context";
import { useTheme } from "@/contexts/theme-context";
import type { ThemePreference } from "@/contexts/theme-context";
import { apiFetch } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { Language } from "@/i18n/translations";

const FALLBACK_COLOR = "#16A34A";

type UpdateWorkspaceResponse = {
  workspace: {
    id: string;
    name: string;
    slug: string;
    color: string;
    updated: boolean;
  };
};

type ProfileResponse = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    loginMethod: "social" | "credentials";
    providers: Array<{
      id: string;
      provider: string;
      type: string;
      label: string;
    }>;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
  };
};

export function WorkspacePreferencesSection() {
  const { workspace, role } = useWorkspace();
  const workspaceSlug = workspace?.slug ?? null;
  const canManageWorkspace = useMemo(
    () => role === WorkspaceRole.ADMIN || role === WorkspaceRole.OWNER,
    [role],
  );

  const { messages, language, setLanguage, locale } = useTranslation();
  const preferencesCopy = messages.crm.settings.preferences;

  const languageOptions = useMemo(
    () => Object.entries(messages.common.languages) as Array<[Language, string]>,
    [messages.common.languages],
  );

  const { theme, setTheme } = useTheme();

  const queryClient = useQueryClient();

  const [workspaceName, setWorkspaceName] = useState(workspace?.name ?? "");
  const [workspaceColor, setWorkspaceColor] = useState(
    (workspace?.color ?? FALLBACK_COLOR).toUpperCase(),
  );
  const [formErrors, setFormErrors] = useState<{ name?: string }>(() => ({}));

  useEffect(() => {
    setWorkspaceName(workspace?.name ?? "");
  }, [workspace?.name]);

  useEffect(() => {
    setWorkspaceColor((workspace?.color ?? FALLBACK_COLOR).toUpperCase());
  }, [workspace?.color]);

  const profileQuery = useQuery({
    queryKey: ["me", "profile"],
    queryFn: async () => apiFetch<ProfileResponse>("/api/me/profile"),
  });

  const updateWorkspaceMutation = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      if (!workspaceSlug) {
        throw new Error(preferencesCopy.workspace.invalidWorkspace);
      }
      return apiFetch<UpdateWorkspaceResponse>(`/api/workspaces/${workspaceSlug}`, {
        method: "PATCH",
        body: JSON.stringify({ name, color }),
      });
    },
    onSuccess: ({ workspace: updated }) => {
      if (!workspaceSlug) return;

      const { updated: didUpdate, ...workspaceData } = updated;

      queryClient.setQueryData(
        ["workspace", workspaceSlug],
        (current: unknown) => {
          if (!current || typeof current !== "object") return current;
          if (!("workspace" in current)) return current;
          const currentWorkspace = (current as { workspace?: Record<string, unknown> }).workspace ?? {};
          return {
            ...(current as Record<string, unknown>),
            workspace: {
              ...currentWorkspace,
              ...workspaceData,
            },
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceSlug] });

      setWorkspaceName(workspaceData.name);
      setWorkspaceColor(workspaceData.color.toUpperCase());

      if (didUpdate) {
        toast.success(preferencesCopy.workspace.updatedToast);
      } else {
        toast.success(preferencesCopy.workspace.noChangesToast);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleWorkspaceSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({});

    const trimmedName = workspaceName.trim();

    if (!trimmedName) {
      setFormErrors({ name: preferencesCopy.workspace.validation.nameRequired });
      return;
    }

    if (!workspaceSlug) {
      toast.error(preferencesCopy.workspace.invalidWorkspace);
      return;
    }

    const hasChanges =
      trimmedName !== (workspace?.name ?? "") ||
      workspaceColor.toLowerCase() !== (workspace?.color?.toLowerCase() ?? "");

    if (!hasChanges) {
      toast.success(preferencesCopy.workspace.noChangesToast);
      return;
    }

    updateWorkspaceMutation.mutate({ name: trimmedName, color: workspaceColor });
  };

  const providers = profileQuery.data?.user.providers ?? [];
  const providerLabels = providers.map((item) => item.label).join(", ");
  const loginLabel = profileQuery.data?.user
    ? profileQuery.data.user.loginMethod === "social"
      ? preferencesCopy.account.loginSocial.replace("{{provider}}", providerLabels || "Social")
      : preferencesCopy.account.loginCredentials
    : "";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-foreground">{preferencesCopy.workspace.title}</h2>
          <p className="text-sm text-muted-foreground">{preferencesCopy.workspace.subtitle}</p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleWorkspaceSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="workspace-settings-name">
                <FieldTitle>{preferencesCopy.workspace.nameLabel}</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="workspace-settings-name"
                  value={workspaceName}
                  onChange={(event) => setWorkspaceName(event.target.value)}
                  disabled={!canManageWorkspace || updateWorkspaceMutation.isPending}
                  placeholder={preferencesCopy.workspace.namePlaceholder}
                  aria-invalid={Boolean(formErrors.name)}
                  aria-describedby={formErrors.name ? "workspace-settings-name-error" : undefined}
                />
                <FieldDescription>{preferencesCopy.workspace.nameDescription}</FieldDescription>
                <FieldError
                  id="workspace-settings-name-error"
                  errors={formErrors.name ? [{ message: formErrors.name }] : undefined}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="workspace-settings-color">
                <FieldTitle>{preferencesCopy.workspace.colorLabel}</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <div className="flex items-center gap-3">
                  <Input
                    id="workspace-settings-color"
                    type="color"
                    value={workspaceColor}
                    onChange={(event) => setWorkspaceColor(event.target.value.toUpperCase())}
                    disabled={!canManageWorkspace || updateWorkspaceMutation.isPending}
                    className="h-12 w-20 cursor-pointer"
                  />
                  <span className="rounded-md border border-border px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {workspaceColor}
                  </span>
                </div>
                <FieldDescription>{preferencesCopy.workspace.colorDescription}</FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {!canManageWorkspace ? (
              <p className="text-sm text-muted-foreground">{preferencesCopy.workspace.permissionWarning}</p>
            ) : (
              <span />
            )}
            <Button
              type="submit"
              disabled={!canManageWorkspace || !workspaceSlug || updateWorkspaceMutation.isPending}
            >
              {updateWorkspaceMutation.isPending
                ? preferencesCopy.workspace.saving
                : preferencesCopy.workspace.save}
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-foreground">{preferencesCopy.account.title}</h2>
          <p className="text-sm text-muted-foreground">{preferencesCopy.account.subtitle}</p>
        </div>

        {profileQuery.isLoading ? (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : profileQuery.isError ? (
          <p className="mt-6 text-sm text-destructive">{preferencesCopy.account.error}</p>
        ) : profileQuery.data ? (
          <dl className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {preferencesCopy.account.name}
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {profileQuery.data.user.name ?? preferencesCopy.account.empty}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {preferencesCopy.account.email}
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {profileQuery.data.user.email ?? preferencesCopy.account.empty}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {preferencesCopy.account.login}
              </dt>
              <dd className="mt-1 text-sm text-foreground">{loginLabel}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {preferencesCopy.account.lastLogin}
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {formatDate(profileQuery.data.user.lastLoginAt, { locale })}
              </dd>
            </div>
          </dl>
        ) : null}

        {profileQuery.data ? (
          <FieldSeparator className="mt-6" />
        ) : null}

        {profileQuery.data ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-semibold text-foreground">{preferencesCopy.account.providers}</p>
            {providers.length === 0 ? (
              <p className="text-sm text-muted-foreground">{preferencesCopy.account.noProviders}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {providers.map((provider) => (
                  <Badge key={provider.id} variant="outline">
                    {provider.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-foreground">{preferencesCopy.experience.title}</h2>
          <p className="text-sm text-muted-foreground">{preferencesCopy.experience.subtitle}</p>
        </div>

        <div className="mt-6 space-y-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="workspace-settings-theme">
                <FieldTitle>{preferencesCopy.experience.themeLabel}</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Select
                  id="workspace-settings-theme"
                  value={theme}
                  onChange={(event) => {
                    const value = event.target.value as ThemePreference;
                    setTheme(value);
                    toast.success(
                      value === "dark"
                        ? preferencesCopy.experience.themeUpdatedDark
                        : value === "light"
                          ? preferencesCopy.experience.themeUpdatedLight
                          : preferencesCopy.experience.themeUpdatedSystem,
                    );
                  }}
                >
                  <option value="system">{messages.common.themeToggle.system}</option>
                  <option value="light">{messages.common.themeToggle.light}</option>
                  <option value="dark">{messages.common.themeToggle.dark}</option>
                </Select>
                <FieldDescription>{preferencesCopy.experience.themeDescription}</FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="workspace-settings-language">
                <FieldTitle>{preferencesCopy.experience.languageLabel}</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Select
                  id="workspace-settings-language"
                  value={language}
                  onChange={(event) => {
                    const nextLanguage = event.target.value as Language;
                    setLanguage(nextLanguage);
                    const languageLabel = languageOptions.find(([value]) => value === nextLanguage)?.[1] ?? nextLanguage;
                    toast.success(
                      preferencesCopy.experience.languageUpdated.replace(
                        "{{language}}",
                        languageLabel,
                      ),
                    );
                  }}
                >
                  {languageOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <FieldDescription>{preferencesCopy.experience.languageDescription}</FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>
        </div>
      </div>
    </div>
  );
}
