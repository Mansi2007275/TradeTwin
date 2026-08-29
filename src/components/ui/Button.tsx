"use client";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "yellow";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary: "brutal-btn brutal-btn-primary text-white",
  secondary: "brutal-btn bg-white text-[var(--ink)]",
  ghost: "brutal-btn bg-[var(--surface-inset)] text-[var(--text-muted)]",
  danger: "brutal-btn brutal-btn-coral",
  success: "brutal-btn brutal-btn-mint",
  yellow: "brutal-btn brutal-btn-yellow",
};

const sizes = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
