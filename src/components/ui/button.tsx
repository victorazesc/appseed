import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-emerald-500 text-emerald-950 shadow-sm hover:bg-emerald-600 focus-visible:bg-emerald-600",
  outline:
    "border border-emerald-500 text-emerald-600 hover:bg-emerald-50 focus-visible:bg-emerald-50",
  ghost:
    "text-emerald-600 hover:bg-emerald-50 focus-visible:bg-emerald-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  default: "h-12 px-6 text-base",
  lg: "h-14 px-8 text-lg",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
      variantClasses[variant],
      sizeClasses[size],
      className,
    );

    if (asChild && React.isValidElement(children)) {
      const element = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(element, {
        className: cn(element.props.className, classes),
      });
    }

    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
