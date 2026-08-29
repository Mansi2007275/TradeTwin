import { cn } from "@/lib/utils";

export function LiveIndicator({
  label,
  active = true,
  className,
}: {
  label: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[11px] font-medium tracking-wide text-[var(--text-muted)]",
        className,
      )}
    >
      <span
        className={cn(
          "relative flex h-2 w-2",
          active ? "text-[var(--success)]" : "text-[var(--text-faint)]",
        )}
        aria-hidden
      >
        {active && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40" />
        )}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
      </span>
      {label}
    </span>
  );
}

export function AccentPulse({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none absolute -inset-3 rounded-[inherit] bg-[var(--accent-glow)] blur-xl" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function SectionEyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "type-eyebrow mb-2",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function DataValue({
  children,
  accent,
  size = "lg",
  className,
}: {
  children: React.ReactNode;
  accent?: boolean;
  size?: "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    md: "text-lg",
    lg: "text-2xl sm:text-3xl",
    xl: "text-3xl sm:text-4xl",
  };

  return (
    <p
      className={cn(
        "font-data font-semibold tabular-nums tracking-tight",
        sizes[size],
        accent ? "text-[var(--accent)]" : "text-[var(--text-display)]",
        className,
      )}
    >
      {children}
    </p>
  );
}
