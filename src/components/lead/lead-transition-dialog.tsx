"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { usePipelines } from "@/contexts/pipeline-context";
import { useTranslation } from "@/contexts/i18n-context";
import type { LeadSummary } from "@/types";
import { leadTransitionSchema } from "@/lib/validators";
import { z } from "zod";
import { toast } from "sonner";

type FormValues = z.infer<typeof leadTransitionSchema>;

type LeadTransitionDialogProps = {
  lead: LeadSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LeadTransitionDialog({ lead, open, onOpenChange }: LeadTransitionDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { pipelines } = usePipelines();
  const { messages } = useTranslation();
  const modalCopy = messages.crm.leadTransition;

  const form = useForm<FormValues>({
    resolver: zodResolver(leadTransitionSchema),
    defaultValues: {
      pipelineId: "",
      stageId: "",
      copyActivities: true,
      archiveOriginal: false,
    },
  });

  const { register, handleSubmit, watch, reset, setValue, control, formState } = form;
  const { errors, isSubmitting } = formState;

  const availablePipelines = useMemo(
    () => pipelines.filter((pipeline) => pipeline.id !== lead?.pipelineId),
    [pipelines, lead?.pipelineId],
  );

  const targetPipelineId = watch("pipelineId");
  const targetPipeline = useMemo(
    () => availablePipelines.find((pipeline) => pipeline.id === targetPipelineId),
    [availablePipelines, targetPipelineId],
  );
  const targetStages = targetPipeline?.stages ?? [];
  const currentStageId = watch("stageId");

  useEffect(() => {
    if (open) {
      const defaultPipeline = availablePipelines[0];
      reset({
        pipelineId: defaultPipeline?.id ?? "",
        stageId: defaultPipeline?.stages?.[0]?.id ?? "",
        copyActivities: true,
        archiveOriginal: false,
      });
    }
  }, [open, availablePipelines, reset]);

  useEffect(() => {
    if (!targetPipeline) return;
    if (!targetPipeline.stages?.length) {
      setValue("stageId", "");
      return;
    }
    if (!targetPipeline.stages.some((stage) => stage.id === currentStageId)) {
      setValue("stageId", targetPipeline.stages[0]?.id ?? "");
    }
  }, [targetPipeline, setValue, currentStageId]);

  const onSubmit = handleSubmit(async (values) => {
    if (!lead || !values.pipelineId) return;

    try {
      const payload = {
        ...values,
        stageId: values.stageId || undefined,
      };

      const response = await fetch(`/api/leads/${lead.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json();

      if (!response.ok) {
        if (body?.error === "already_transferred") {
          toast.error(modalCopy.duplicate.replace("{{pipeline}}", body.pipelineName));
          return;
        }
        throw new Error(body?.error ?? modalCopy.error);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
        queryClient.invalidateQueries({ queryKey: ["pipelines"] }),
      ]);

      toast.success(modalCopy.success.replace("{{pipeline}}", body.pipelineName), {
        action: {
          label: modalCopy.open,
          onClick: () => {
            const params = new URLSearchParams(window.location.search);
            params.set("pipelineId", body.pipelineId);
            router.push(`/dashboard?${params.toString()}#lead-${body.newLeadId}`);
          },
        },
      });

      onOpenChange(false);
    } catch (error) {
      console.error("transition lead", error);
      toast.error(modalCopy.error);
    }
  });

  const isSubmitDisabled = !availablePipelines.length || isSubmitting;

  return (
    <Dialog open={open && Boolean(lead)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{modalCopy.title}</DialogTitle>
          <DialogDescription>{modalCopy.description}</DialogDescription>
        </DialogHeader>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="transition-pipeline">{modalCopy.pipelineLabel}</Label>
            <select
              id="transition-pipeline"
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={!availablePipelines.length}
              {...register("pipelineId")}
            >
              {availablePipelines.map((pipeline) => (
                <option key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </option>
              ))}
            </select>
            {errors.pipelineId ? (
              <p className="text-xs text-destructive">{errors.pipelineId.message}</p>
            ) : null}
            {!availablePipelines.length ? (
              <p className="text-xs text-muted-foreground">{modalCopy.empty}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transition-stage">{modalCopy.stageLabel}</Label>
            <select
              id="transition-stage"
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={!targetStages.length}
              {...register("stageId")}
            >
              {targetStages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
            {errors.stageId ? (
              <p className="text-xs text-destructive">{errors.stageId.message}</p>
            ) : null}
          </div>

          <div className="space-y-3">
            <Controller
              name="copyActivities"
              control={control}
              render={({ field }) => (
                <Label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  />
                  {modalCopy.copyActivities}
                </Label>
              )}
            />
            <Controller
              name="archiveOriginal"
              control={control}
              render={({ field }) => (
                <Label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  />
                  {modalCopy.archiveOriginal}
                </Label>
              )}
            />
          </div>

          <DialogFooter className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {modalCopy.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {isSubmitting ? modalCopy.submitting : modalCopy.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
