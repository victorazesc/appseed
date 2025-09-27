import type { DetailsHTMLAttributes, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface AccordionItemProps extends DetailsHTMLAttributes<HTMLDetailsElement> {
  title: string;
  defaultOpen?: boolean;
}

export function Accordion({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-3", className)} {...props} />;
}

export function AccordionItem({
  title,
  defaultOpen,
  className,
  children,
  open: controlledOpen,
  ...rest
}: AccordionItemProps) {
  return (
    <details
      className={cn(
        "group rounded-2xl border border-slate-700/50 bg-slate-800/80 px-4 py-3 text-slate-100 transition",
        "open:border-emerald-500/60 open:bg-slate-800/90",
        className,
      )}
      {...rest}
      open={controlledOpen ?? (defaultOpen ? true : undefined)}
    >
      <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-medium text-slate-50">
        {title}
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-700/70 text-slate-200 transition group-open:rotate-180 group-open:bg-emerald-500/70 group-open:text-white">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </summary>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-200">{children}</div>
    </details>
  );
}
