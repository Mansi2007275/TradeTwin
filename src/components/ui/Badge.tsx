import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
  className?: string;
}

const variants = {
  default: "bg-[var(--surface-inset)] text-[var(--ink)] border-[3px] border-[var(--ink)]",
  outline: "bg-white text-[var(--ink)] border-[3px] border-[var(--ink)]",
  success: "bg-[var(--brutal-mint)] text-[var(--ink)] border-[3px] border-[var(--ink)]",
  warning: "bg-[var(--brutal-yellow)] text-[var(--ink)] border-[3px] border-[var(--ink)]",
  error: "bg-[var(--brutal-coral)] text-white border-[3px] border-[var(--ink)]",
  info: "bg-[var(--brutal-blue-mid)] text-[var(--ink)] border-[3px] border-[var(--ink)]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide shadow-[2px_2px_0_var(--ink)]",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
