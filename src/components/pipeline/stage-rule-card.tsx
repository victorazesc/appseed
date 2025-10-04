"use client";

import { useEffect, useMemo } from "react";
import { useWatch, type Control, type FieldErrors, type UseFormRegister, type UseFormSetValue } from "react-hook-form";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import type { Pipeline, StageTransitionMode } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/contexts/i18n-context";

export type StageRuleFormStage = {
  id?: string;
  name: string;
  transitionMode: StageTransitionMode;
  transitionTargetPipelineId?: string | null;
  transitionTargetStageId?: string | null;
  transitionCopyActivities: boolean;
  transitionArchiveSource: boolean;
};

export type StageRuleFormValues = {
  stages: StageRuleFormStage[];
};

type StageRuleCardProps = {
  index: number;
  control: Control<StageRuleFormValues>;
  register: UseFormRegister<StageRuleFormValues>;
  setValue: UseFormSetValue<StageRuleFormValues>;
  errors?: FieldErrors<StageRuleFormValues>;
  pipelines: Pipeline[];
  currentPipelineId?: string;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  disableRemove?: boolean;
};

export function StageRuleCard({
  index,
  control,
  register,
  setValue,
  errors,
  pipelines,
  currentPipelineId,
  isFirst,
  isLast,
  onMoveDown,
  onMoveUp,
  onRemove,
  disableRemove,
}: StageRuleCardProps) {
  const { messages } = useTranslation();
  const stageCopy = messages.crm.pipelineModal.stageRules;

  const stage = useWatch({ control, name: `stages.${index}` }) as StageRuleFormStage | undefined;

  const mode = stage?.transitionMode ?? "NONE";
  const hasRule = mode !== "NONE";

  const availablePipelines = useMemo(
    () => pipelines.filter((pipeline) => pipeline.id !== currentPipelineId),
    [pipelines, currentPipelineId],
  );

  const targetPipeline = availablePipelines.find((pipeline) => pipeline.id === stage?.transitionTargetPipelineId);
  const targetStages = useMemo(() => targetPipeline?.stages ?? [], [targetPipeline]);

  useEffect(() => {
    if (!hasRule) {
      setValue(`stages.${index}.transitionTargetPipelineId`, null, { shouldDirty: true });
      setValue(`stages.${index}.transitionTargetStageId`, null, { shouldDirty: true });
      setValue(`stages.${index}.transitionCopyActivities`, true, { shouldDirty: true });
      setValue(`stages.${index}.transitionArchiveSource`, false, { shouldDirty: true });
    }
  }, [hasRule, index, setValue]);

  useEffect(() => {
    if (!hasRule) return;
    if (!targetPipeline) {
      setValue(`stages.${index}.transitionTargetStageId`, null, { shouldDirty: true });
      return;
    }
    const selectedStageId = stage?.transitionTargetStageId ?? null;
    if (!selectedStageId || !targetStages.some((item) => item.id === selectedStageId)) {
      setValue(`stages.${index}.transitionTargetStageId`, targetStages[0]?.id ?? null, {
        shouldDirty: true,
      });
    }
  }, [hasRule, index, setValue, stage?.transitionTargetStageId, targetPipeline, targetStages]);

  const handleToggleRule = (checked: boolean) => {
    if (checked) {
      setValue(`stages.${index}.transitionMode`, stage?.transitionMode && stage.transitionMode !== "NONE" ? stage.transitionMode : "MANUAL", {
        shouldDirty: true,
      });
      setValue(`stages.${index}.transitionCopyActivities`, stage?.transitionCopyActivities ?? true, {
        shouldDirty: true,
      });
      setValue(`stages.${index}.transitionArchiveSource`, stage?.transitionArchiveSource ?? false, {
        shouldDirty: true,
      });
    } else {
      setValue(`stages.${index}.transitionMode`, "NONE", { shouldDirty: true });
    }
  };

  const handleModeChange = (value: string) => {
    const nextMode: StageTransitionMode = value === "AUTO" ? "AUTO" : "MANUAL";
    setValue(`stages.${index}.transitionMode`, nextMode, { shouldDirty: true });
  };

  const stageErrors = errors?.stages?.[index];

  return (
    <div className="rounded-xl border border-border bg-card/80 p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-2">
          <Label htmlFor={`stage-name-${index}`}>{stageCopy.stageName}</Label>
          <Input
            id={`stage-name-${index}`}
            placeholder={stageCopy.stageName}
            {...register(`stages.${index}.name` as const)}
          />
          {stageErrors && "name" in stageErrors ? (
            <p className="text-xs text-destructive">{(stageErrors.name as { message?: string })?.message}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label={stageCopy.moveUp}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label={stageCopy.moveDown}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onRemove}
            disabled={disableRemove}
            aria-label={stageCopy.remove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-foreground">{stageCopy.triggerLabel}</p>
              <p className="text-xs text-muted-foreground">{stageCopy.triggerDescription}</p>
            </div>
            <Switch checked={hasRule} onCheckedChange={handleToggleRule} />
          </div>

          {hasRule ? (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`stage-mode-${index}`}>{stageCopy.modeLabel}</Label>
                  <Select
                    id={`stage-mode-${index}`}
                    value={mode === "AUTO" ? "AUTO" : "MANUAL"}
                    onChange={(event) => handleModeChange(event.target.value)}
                  >
                    <option value="MANUAL">{stageCopy.manual}</option>
                    <option value="AUTO">{stageCopy.auto}</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`stage-target-pipeline-${index}`}>{stageCopy.targetPipeline}</Label>
                  <Select
                    id={`stage-target-pipeline-${index}`}
                    value={stage?.transitionTargetPipelineId ?? ""}
                    onChange={(event) =>
                    setValue(`stages.${index}.transitionTargetPipelineId`, event.target.value || null, {
                      shouldDirty: true,
                    })
                  }
                  disabled={!availablePipelines.length}
                >
                  <option value="">{stageCopy.selectPipeline}</option>
                  {availablePipelines.map((pipeline) => (
                    <option key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`stage-target-stage-${index}`}>{stageCopy.targetStage}</Label>
              <Select
                id={`stage-target-stage-${index}`}
                value={stage?.transitionTargetStageId ?? ""}
                onChange={(event) =>
                  setValue(`stages.${index}.transitionTargetStageId`, event.target.value || null, {
                    shouldDirty: true,
                  })
                }
                disabled={!targetStages.length}
              >
                <option value="">{stageCopy.selectStage}</option>
                {targetStages.map((stageOption) => (
                  <option key={stageOption.id} value={stageOption.id}>
                    {stageOption.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <Label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={stage?.transitionCopyActivities ?? true}
                  onCheckedChange={(checked) =>
                    setValue(`stages.${index}.transitionCopyActivities`, Boolean(checked), {
                      shouldDirty: true,
                    })
                  }
                />
                {stageCopy.copyActivities}
              </Label>
              <Label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={stage?.transitionArchiveSource ?? false}
                  onCheckedChange={(checked) =>
                    setValue(`stages.${index}.transitionArchiveSource`, Boolean(checked), {
                      shouldDirty: true,
                    })
                  }
                />
                {stageCopy.archiveSource}
              </Label>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
