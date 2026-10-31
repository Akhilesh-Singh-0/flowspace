import Link from "next/link";
import type { ReactNode, MouseEventHandler } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  href?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

const baseClasses =
  "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-primary bg-primary text-primary-foreground hover:brightness-110",

  secondary:
    "border border-border bg-surface-raised text-foreground hover:bg-surface-hover",

  ghost:
    "border border-transparent bg-transparent text-text-secondary hover:bg-surface-hover hover:text-foreground",
};

export function Button({
  children,
  variant = "primary",
  href,
  className = "",
  type = "button",
  disabled = false,
  onClick,
}: ButtonProps) {
  const classes = [baseClasses, variantClasses[variant], className]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link
        href={disabled ? "#" : href}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        onClick={disabled ? (event) => event.preventDefault() : undefined}
        className={`${classes}${disabled ? " pointer-events-none opacity-50" : ""}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}