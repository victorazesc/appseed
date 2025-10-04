"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Separator } from "@/components/ui/separator";
import { pipelineCreateSchema, pipelineUpdateSchema } from "@/lib/validators";
import { useTranslation } from "@/contexts/i18n-context";
import { useActivePipeline, usePipelines } from "@/contexts/pipeline-context";
import { apiFetch } from "@/lib/api-client";
import type { Pipeline, Stage } from "@/types";

const DEFAULT_COLOR = "#16A34A";

type StageInput = {
  id?: string;
  name: string;
};

type FormValues = {
  name: string;
  color: string;
  stages: StageInput[];
};

type NewPipelineDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipeline?: Pipeline & { stages?: Stage[] };
};

export function NewPipelineDialog({ open, onOpenChange, pipeline }: NewPipelineDialogProps) {
  const { messages } = useTranslation();
  const { refetch } = usePipelines();
  const { setActivePipelineId } = useActivePipeline();
  const t = messages.crm.pipelineModal;

  const form = useForm<FormValues>({
    resolver: zodResolver(pipeline ? pipelineUpdateSchema : pipelineCreateSchema),
    defaultValues: {
      name: pipeline?.name ?? "",
      color: pipeline?.color ?? DEFAULT_COLOR,
      stages: pipeline?.stages?.map((stage) => ({ id: stage.id, name: stage.name })) ?? [
        { name: "Stage 1" },
        { name: "Stage 2" },
      ],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "stages",
  });

  useEffect(() => {
    if (open) {
      reset({
        name: pipeline?.name ?? "",
        color: pipeline?.color ?? DEFAULT_COLOR,
        stages:
          pipeline?.stages?.map((stage) => ({ id: stage.id, name: stage.name })) ?? [
            { name: "Etapa 1" },
            { name: "Etapa 2" },
          ],
      });
    }
  }, [open, pipeline, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (values.stages.length === 0) {
        toast.error(messages.crm.pipelineModal.stageNameRequired);
        return;
      }

      const payload = {
        name: values.name,
        color: values.color,
        stages: values.stages.map((stage) => ({ id: stage.id, name: stage.name })),
      };

      if (pipeline?.id) {
        await apiFetch(`/api/pipelines/${pipeline.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        await refetch();
        toast.success(messages.crm.pipelineModal.saved ?? "Funil atualizado");
      } else {
        const response = await apiFetch<{ pipeline: Pipeline }>("/api/pipelines", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const created = response.pipeline;
        await refetch();
        if (created) {
          setActivePipelineId(created.id);
        }
        toast.success(messages.crm.pipelineModal.created ?? "Funil criado");
      }

      onOpenChange(false);
    } catch (error) {
      console.error("submit pipeline", error);
      toast.error(messages.crm.pipelineModal.error ?? "Não foi possível salvar o funil.");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{pipeline ? t.editTitle ?? t.title : t.title}</DialogTitle>
          <DialogDescription>{pipeline ? t.editDescription ?? "" : t.description ?? ""}</DialogDescription>
        </DialogHeader>
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pipeline-name">{t.nameLabel}</Label>
              <Input id="pipeline-name" placeholder={t.namePlaceholder ?? "Funil"} {...register("name")} />
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pipeline-color">{t.colorLabel}</Label>
              <Input
                id="pipeline-color"
                type="color"
                className="h-12 w-24 cursor-pointer rounded-xl border border-border bg-background p-1"
                {...register("color")}
              />
              {errors.color ? (
                <p className="text-xs text-destructive">{errors.color.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t.stagesLabel}</Label>
                <p className="text-xs text-muted-foreground">{t.stagesHelper}</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => append({ name: "" })}>
                {t.addStage}
              </Button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3 md:flex-row md:items-center md:gap-3"
                >
                  <div className="flex-1">
                    <Input
                      placeholder={t.stagePlaceholder}
                      {...register(`stages.${index}.name` as const)}
                    />
                    {errors.stages?.[index]?.name ? (
                      <p className="text-xs text-destructive">{errors.stages[index]?.name?.message}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8"
                      onClick={() => index > 0 && move(index, index - 1)}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8"
                      onClick={() => index < fields.length - 1 && move(index, index + 1)}
                      disabled={index === fields.length - 1}
                    >
                      ↓
                    </Button>
                    <Separator orientation="vertical" className="hidden h-6 md:block" />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-8"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                    >
                      {t.deleteStage}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? messages.common.contactForm.buttons.submitting : pipeline ? t.save : t.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
