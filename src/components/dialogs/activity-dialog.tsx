"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { LeadSummary } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  type: z.enum(["note", "call", "email", "whatsapp", "task"]),
  content: z.string().min(1, "Informe o conteúdo"),
  dueAt: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ActivityDialogProps = {
  lead: LeadSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: { leadId: string; type: FormValues["type"]; content: string; dueAt?: string }) => Promise<void>;
  initialType?: FormValues["type"];
  initialContent?: string;
};

export function ActivityDialog({
  lead,
  open,
  onOpenChange,
  onCreate,
  initialType = "note",
  initialContent = "",
}: ActivityDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialType,
      content: initialContent,
      dueAt: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const type = watch("type");

  useEffect(() => {
    if (open) {
      reset({ type: initialType, content: initialContent, dueAt: "" });
    }
  }, [open, reset, initialType, initialContent]);

  const onSubmit = handleSubmit(async (values) => {
    if (!lead) return;

    await onCreate({
      leadId: lead.id,
      type: values.type,
      content: values.content,
      dueAt: values.dueAt ? new Date(values.dueAt).toISOString() : undefined,
    });

    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova atividade {lead ? `para ${lead.name}` : ""}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="activity-type">Tipo</Label>
            <select
              id="activity-type"
              {...register("type")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="note">Nota</option>
              <option value="call">Ligação</option>
              <option value="email">E-mail</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="task">Tarefa</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-content">Conteúdo</Label>
            <Textarea
              id="activity-content"
              rows={4}
              placeholder="Descreva a atividade"
              {...register("content")}
            />
            {errors.content ? (
              <p className="text-xs text-destructive">{errors.content.message}</p>
            ) : null}
          </div>
          {type === "task" ? (
            <div className="space-y-2">
              <Label htmlFor="activity-due">Vencimento</Label>
              <Input
                id="activity-due"
                type="datetime-local"
                {...register("dueAt")}
                aria-invalid={Boolean(errors.dueAt)}
              />
              {errors.dueAt ? (
                <p className="text-xs text-destructive">{errors.dueAt.message}</p>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !lead}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
