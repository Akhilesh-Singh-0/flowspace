import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  href?: string;
};

const baseClasses =
  "inline-flex h-8 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border px-3 text-medium font-semibold leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-bone text-text-inverse hover:bg-bone-hover",

  secondary:
    "border-line bg-surface-raised text-foreground hover:border-line-strong hover:bg-surface-hover",

  ghost:
    "border-transparent bg-transparent text-text-secondary hover:bg-surface-hover hover:text-foreground",

  danger:
    "border-transparent bg-transparent text-text-secondary hover:bg-surface-hover hover:text-priority-urgent",
};

export function Button({
  variant = "primary",
  href,
  className,
  type = "button",
  disabled = false,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(baseClasses, variantClasses[variant], className);

  if (href) {
    return (
      <Link
        href={disabled ? "#" : href}
        aria-disabled={disabled || undefined}
        aria-label={props["aria-label"]}
        tabIndex={disabled ? -1 : undefined}
        onClick={disabled ? (event) => event.preventDefault() : undefined}
        className={cn(classes, disabled && "pointer-events-none opacity-50")}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
