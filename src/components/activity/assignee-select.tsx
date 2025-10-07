"use client";

import * as React from "react";
import { Loader2, UserCircle2 } from "lucide-react";

import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useWorkspaceUsers } from "@/hooks/use-workspace-users";

type AssigneeSelectProps = {
  value?: string | null;
  onChange?: (value: string | null) => void;
  allowUnassigned?: boolean;
  labelUnassigned?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export function AssigneeSelect({
  value,
  onChange,
  allowUnassigned = true,
  labelUnassigned = "Sem responsável",
  disabled,
  placeholder = "Selecione um responsável",
  className,
}: AssigneeSelectProps) {
  const { data, isLoading } = useWorkspaceUsers();
  const currentValue = value ?? "";

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextValue = event.target.value;
      onChange?.(nextValue ? nextValue : null);
    },
    [onChange],
  );

  return (
    <div className={cn("relative", className)}>
      <Select
        value={currentValue}
        onChange={handleChange}
        disabled={disabled || isLoading}
        className="pr-10"
      >
        <option value="">{allowUnassigned ? labelUnassigned : placeholder}</option>
        {data?.map((user) => {
          const label = user.name?.trim() || user.email || "Usuário";
          return (
            <option key={user.id} value={user.id}>
              {label}
            </option>
          );
        })}
      </Select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserCircle2 className="h-4 w-4" />
        )}
      </span>
    </div>
  );
}
