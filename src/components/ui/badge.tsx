import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type BadgeProps = HTMLAttributes<HTMLDivElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200",
        className,
      )}
      {...props}
    />
  );
}
