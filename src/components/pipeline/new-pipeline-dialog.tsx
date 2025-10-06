"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useFieldArray,
  useForm,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { pipelineCreateSchema, pipelineUpdateSchema } from "@/lib/validators";
import { useTranslation } from "@/contexts/i18n-context";
import { useActivePipeline, usePipelines } from "@/contexts/pipeline-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { apiFetch } from "@/lib/api-client";
import type { Pipeline, PipelineWebhookConfig, Stage } from "@/types";
import { cn } from "@/lib/utils";
import {
  StageRuleCard,
  type StageRuleFormStage,
  type StageRuleFormValues,
} from "./stage-rule-card";
import { WebhookTestDialog } from "./webhook-test-dialog";

const DEFAULT_COLOR = "#16A34A";

type FormValues = StageRuleFormValues & {
  name: string;
  color: string;
};

type NewPipelineDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipeline?: Pipeline & { stages?: Stage[] };
};

function mapStageToForm(stage: Stage): StageRuleFormStage {
  return {
    id: stage.id,
    name: stage.name,
    transitionMode: stage.transitionMode ?? "NONE",
    transitionTargetPipelineId: stage.transitionTargetPipelineId ?? null,
    transitionTargetStageId: stage.transitionTargetStageId ?? null,
    transitionCopyActivities: stage.transitionCopyActivities ?? true,
    transitionArchiveSource: stage.transitionArchiveSource ?? false,
  };
}

function createEmptyStage(name = ""): StageRuleFormStage {
  return {
    name,
    transitionMode: "NONE",
    transitionTargetPipelineId: null,
    transitionTargetStageId: null,
    transitionCopyActivities: true,
    transitionArchiveSource: false,
  };
}

export function NewPipelineDialog({ open, onOpenChange, pipeline }: NewPipelineDialogProps) {
  const { messages } = useTranslation();
  const { refetch, pipelines } = usePipelines();
  const { setActivePipelineId } = useActivePipeline();
  const modalCopy = messages.crm.pipelineModal;
  const webhookCopy = modalCopy.webhook;
  const tabsCopy = modalCopy.tabs;
  const stageRulesCopy = modalCopy.stageRules;
  const { workspace } = useWorkspace();
  const workspaceSlug = workspace?.slug;
  const appendWorkspace = useCallback(
    (url: string) => {
      if (!workspaceSlug) return url;
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}workspaceSlug=${encodeURIComponent(workspaceSlug)}`;
    },
    [workspaceSlug],
  );

  const [activeTab, setActiveTab] = useState<"details" | "webhook">("details");
  const [webhookConfig, setWebhookConfig] = useState<PipelineWebhookConfig | null>(null);
  const [isWebhookLoading, setWebhookLoading] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);

  const initialStages = useMemo(() => {
    if (pipeline?.stages?.length) {
      return [...pipeline.stages]
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map(mapStageToForm);
    }

    return [createEmptyStage("Etapa 1"), createEmptyStage("Etapa 2")];
  }, [pipeline?.stages]);

  const form = useForm<FormValues>({
    resolver: zodResolver(pipeline ? pipelineUpdateSchema : pipelineCreateSchema),
    defaultValues: {
      name: pipeline?.name ?? "",
      color: pipeline?.color ?? DEFAULT_COLOR,
      stages: initialStages,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const stageControl = control as unknown as Control<StageRuleFormValues>;
  const stageRegister = register as unknown as UseFormRegister<StageRuleFormValues>;
  const stageSetValue = setValue as unknown as UseFormSetValue<StageRuleFormValues>;
  const stageErrors = errors as unknown as FieldErrors<StageRuleFormValues>;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "stages",
  });

  useEffect(() => {
    if (!open) return;
    setActiveTab("details");
    const stages = pipeline?.stages?.length ? initialStages : [createEmptyStage("Etapa 1"), createEmptyStage("Etapa 2")];
    reset({
      name: pipeline?.name ?? "",
      color: pipeline?.color ?? DEFAULT_COLOR,
      stages,
    });
  }, [open, pipeline?.id, pipeline?.name, pipeline?.color, pipeline?.stages?.length, initialStages, reset]);

  useEffect(() => {
    if (!open || !pipeline?.id) {
      setWebhookConfig(null);
      setWebhookError(null);
      return;
    }

    if (!workspaceSlug) {
      setWebhookConfig(null);
      setWebhookError(webhookCopy.error);
      return;
    }

    let isActive = true;
    setWebhookLoading(true);
    apiFetch<PipelineWebhookConfig>(appendWorkspace(`/api/pipelines/${pipeline.id}/webhook`))
      .then((config) => {
        if (!isActive) return;
        setWebhookConfig(config);
        setWebhookError(null);
      })
      .catch((error) => {
        console.error("fetch webhook config", error);
        if (!isActive) return;
        setWebhookError(webhookCopy.error);
      })
      .finally(() => {
        if (isActive) {
          setWebhookLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [appendWorkspace, open, pipeline?.id, webhookCopy.error, workspaceSlug]);

  const handleAddStage = () => {
    append(createEmptyStage(""));
  };

  const handleRotateToken = async () => {
    if (!pipeline?.id) return;
    const confirmed = window.confirm(webhookCopy.rotateConfirm);
    if (!confirmed) return;

    try {
      if (!workspaceSlug) {
        toast.error("Workspace não selecionado");
        return;
      }
      const response = await apiFetch<{ token: string; tokenPreview: string }>(
        appendWorkspace(`/api/pipelines/${pipeline.id}/webhook/rotate`),
        {
          method: "POST",
        },
      );
      setWebhookConfig((prev) =>
        prev
          ? {
              ...prev,
              token: response.token,
              tokenPreview: response.tokenPreview,
            }
          : prev,
      );
      toast.success(webhookCopy.rotateSuccess);
    } catch (error) {
      console.error("rotate webhook token", error);
      toast.error(webhookCopy.rotateError);
    }
  };

  const handleCopy = async (value: string | null | undefined, successMessage: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch (error) {
      console.error("copy clipboard", error);
      toast.error(webhookCopy.copyError);
    }
  };

  const handleDefaultStageChange = async (stageId: string | null) => {
    if (!pipeline?.id) return;

    try {
      if (!workspaceSlug) {
        toast.error("Workspace não selecionado");
        return;
      }
      const response = await apiFetch<{ defaultStageId: string | null }>(appendWorkspace(`/api/pipelines/${pipeline.id}/webhook`), {
        method: "PATCH",
        body: JSON.stringify({ defaultStageId: stageId }),
      });
      setWebhookConfig((prev) =>
        prev
          ? {
              ...prev,
              defaultStageId: response.defaultStageId ?? null,
            }
          : prev,
      );
      toast.success(webhookCopy.stageUpdated);
    } catch (error) {
      console.error("update default webhook stage", error);
      toast.error(webhookCopy.stageError);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (values.stages.length === 0) {
      toast.error(modalCopy.stageNameRequired);
      return;
    }

    const payload = {
      name: values.name,
      color: values.color,
      stages: values.stages.map((stage) => ({
        id: stage.id,
        name: stage.name,
        transitionMode: stage.transitionMode ?? "NONE",
        transitionTargetPipelineId:
          stage.transitionMode === "NONE" ? null : stage.transitionTargetPipelineId ?? null,
        transitionTargetStageId:
          stage.transitionMode === "NONE" ? null : stage.transitionTargetStageId ?? null,
        transitionCopyActivities:
          stage.transitionMode === "NONE" ? true : stage.transitionCopyActivities ?? true,
        transitionArchiveSource:
          stage.transitionMode === "NONE" ? false : stage.transitionArchiveSource ?? false,
      })),
    };

    try {
      if (!workspaceSlug) {
        toast.error("Workspace não selecionado");
        return;
      }
      if (pipeline?.id) {
        await apiFetch(appendWorkspace(`/api/pipelines/${pipeline.id}`), {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        await refetch();
        toast.success(modalCopy.saved ?? "Funil atualizado");
      } else {
        const response = await apiFetch<{ pipeline: Pipeline }>(appendWorkspace(`/api/pipelines`), {
          method: "POST",
          body: JSON.stringify(payload),
        });
        await refetch();
        if (response.pipeline?.id) {
          setActivePipelineId(response.pipeline.id);
        }
        toast.success(modalCopy.created ?? "Funil criado");
      }

      onOpenChange(false);
    } catch (error) {
      console.error("submit pipeline", error);
      toast.error(modalCopy.error ?? "Não foi possível salvar o funil.");
    }
  });

  const currentPipelineId = pipeline?.id;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const pipelineUrl = webhookConfig?.url ? `${baseUrl}${webhookConfig.url}` : "";
  const pipelineSlugUrl = webhookConfig?.slugUrl ? `${baseUrl}${webhookConfig.slugUrl}` : null;

  const stageOptions = webhookConfig?.stages ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-hidden">
        <div className="flex flex-col gap-5 overflow-hidden sm:h-full min-h-0">
          <DialogHeader>
            <DialogTitle>{pipeline ? modalCopy.editTitle ?? modalCopy.title : modalCopy.title}</DialogTitle>
            <DialogDescription>
              {pipeline ? modalCopy.editDescription ?? "" : modalCopy.description ?? ""}
            </DialogDescription>
          </DialogHeader>
          <form className="flex flex-1 flex-col gap-5 overflow-hidden min-h-0" onSubmit={onSubmit}>
            <div className="border-b border-border">
              <nav className="flex gap-2">
                <TabButton
                  active={activeTab === "details"}
                  onClick={() => setActiveTab("details")}
                >
                  {tabsCopy.details}
                </TabButton>
                <TabButton
                  active={activeTab === "webhook"}
                  onClick={() => setActiveTab("webhook")}
                  disabled={!pipeline?.id}
                >
                  {tabsCopy.webhook}
                </TabButton>
              </nav>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1 min-h-0">
              {activeTab === "details" ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pipeline-name">{modalCopy.nameLabel}</Label>
                      <Input
                        id="pipeline-name"
                        placeholder={modalCopy.namePlaceholder ?? "Funil"}
                        {...register("name")}
                      />
                      {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pipeline-color">{modalCopy.colorLabel}</Label>
                      <Input
                        id="pipeline-color"
                        type="color"
                        className="h-12 w-24 cursor-pointer rounded-xl border border-border bg-background p-1"
                        {...register("color")}
                      />
                      {errors.color ? <p className="text-xs text-destructive">{errors.color.message}</p> : null}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                          {modalCopy.stagesLabel}
                        </h3>
                        <p className="text-xs text-muted-foreground">{modalCopy.stagesHelper}</p>
                      </div>
                      <Button type="button" size="sm" variant="outline" onClick={handleAddStage}>
                        {modalCopy.addStage}
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        {stageRulesCopy.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">{stageRulesCopy.subtitle}</p>

                      <div className="space-y-4">
                        {fields.map((field, index) => (
                          <StageRuleCard
                            key={field.id}
                            index={index}
                            control={stageControl}
                            register={stageRegister}
                            setValue={stageSetValue}
                            errors={stageErrors}
                            pipelines={pipelines}
                            currentPipelineId={currentPipelineId}
                            isFirst={index === 0}
                            isLast={index === fields.length - 1}
                            disableRemove={fields.length <= 1}
                            onMoveUp={() => index > 0 && move(index, index - 1)}
                            onMoveDown={() => index < fields.length - 1 && move(index, index + 1)}
                            onRemove={() => {
                              if (fields.length > 1) {
                                remove(index);
                              }
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === "webhook" ? (
                <div className="space-y-4">
                  {!pipeline?.id ? (
                    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                      {webhookCopy.disabled}
                    </div>
                  ) : isWebhookLoading ? (
                    <div className="space-y-3">
                      <div className="h-20 w-full animate-pulse rounded-lg bg-muted/40" />
                      <div className="h-20 w-full animate-pulse rounded-lg bg-muted/40" />
                      <div className="h-20 w-full animate-pulse rounded-lg bg-muted/40" />
                    </div>
                  ) : webhookError ? (
                    <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
                      {webhookError}
                    </div>
                  ) : webhookConfig ? (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-border bg-card/80 p-4">
                        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                          {webhookCopy.endpointTitle}
                        </h4>
                        <div className="mt-3 space-y-3">
                          <EndpointRow
                            label={webhookCopy.idLabel}
                            value={pipelineUrl}
                            onCopy={() => handleCopy(pipelineUrl, webhookCopy.copied)}
                            copyLabel={webhookCopy.copy}
                          />
                          {pipelineSlugUrl ? (
                            <EndpointRow
                              label={webhookCopy.slugLabel}
                              value={pipelineSlugUrl}
                              onCopy={() => handleCopy(pipelineSlugUrl, webhookCopy.copied)}
                              copyLabel={webhookCopy.copy}
                            />
                          ) : null}
                          <p className="text-xs text-muted-foreground">{webhookCopy.methodHint}</p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border bg-card/80 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                              {webhookCopy.tokenLabel}
                            </h4>
                            <p className="text-xs text-muted-foreground">{webhookCopy.tokenHelper}</p>
                            <p className="mt-2 font-mono text-sm text-foreground">
                              {webhookConfig.tokenPreview ?? "••••"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(webhookConfig.token, webhookCopy.tokenCopied)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              {webhookCopy.copy}
                            </Button>
                            <Button type="button" variant="secondary" size="sm" onClick={handleRotateToken}>
                              <RefreshCcw className="mr-2 h-4 w-4" />
                              {webhookCopy.rotate}
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <Label htmlFor="webhook-default-stage">{webhookCopy.defaultStageLabel}</Label>
                          <Select
                            id="webhook-default-stage"
                            value={webhookConfig.defaultStageId ?? ""}
                            onChange={(event) =>
                              handleDefaultStageChange(event.target.value ? event.target.value : null)
                            }
                          >
                            <option value="">{webhookCopy.defaultStageFallback}</option>
                            {stageOptions.map((stage) => (
                              <option key={stage.id} value={stage.id}>
                                {stage.name}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border bg-card/80 p-4">
                        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                          {webhookCopy.exampleTitle}
                        </h4>
                        <p className="mt-2 text-xs text-muted-foreground">{webhookCopy.exampleSubtitle}</p>
                        <pre className="mt-3 overflow-x-auto rounded-lg bg-muted/30 p-4 text-xs text-muted-foreground">
{`curl -X POST "${pipelineUrl}" \\n  -H "Content-Type: application/json" \\n  -H "Authorization: Bearer ${webhookConfig.token ?? "SEU_TOKEN"}" \\n  -d '{
    "name": "Ana Silva",
    "email": "ana@empresa.com",
    "phone": "+55 11 91234-5678",
    "company": "Empresa Exemplo",
    "value": 15000,
    "stage": "Lead Novo",
    "origin": "website_contact",
    "metadata": { "utm_source": "google" }
  }'`}
                        </pre>
                      </div>

                      <div className="flex justify-end">
                        <Button type="button" variant="outline" onClick={() => setTestDialogOpen(true)}>{webhookCopy.testButton}</Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <DialogFooter className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                {modalCopy.cancel}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? messages.common.contactForm.buttons.submitting
                  : pipeline
                    ? modalCopy.save
                    : modalCopy.create}
              </Button>
            </DialogFooter>
        </form>
        </div>

        {webhookConfig ? (
          <WebhookTestDialog
            open={testDialogOpen}
            onOpenChange={setTestDialogOpen}
            config={webhookConfig}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type TabButtonProps = {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function TabButton({ children, active, disabled, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "px-3 py-2 text-sm font-medium transition",
        active
          ? "text-foreground border-b-2 border-emerald-500"
          : "text-muted-foreground hover:text-foreground",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {children}
    </button>
  );
}

type EndpointRowProps = {
  label: string;
  value: string;
  onCopy: () => void;
  copyLabel: string;
};

function EndpointRow({ label, value, onCopy, copyLabel }: EndpointRowProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-mono text-sm text-foreground break-all">{value}</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onCopy}>
        <Copy className="mr-2 h-4 w-4" /> {copyLabel}
      </Button>
    </div>
  );
}
