import { Sparkline, sparklineFromValue } from "./Sparkline";
import { cn } from "@/lib/utils";

export type GradientVariant = "blue" | "slate" | "amber" | "purple" | "emerald" | "rose";

interface GradientStatCardProps {
  label: string;
  value: string;
  trend?: { direction: "up" | "down"; label: string };
  variant: GradientVariant;
  seed?: number;
  className?: string;
}

export function GradientStatCard({
  label,
  value,
  trend,
  seed = 0,
  className,
}: GradientStatCardProps) {
  const points = sparklineFromValue(seed || value.length * 7);

  return (
    <div
      className={cn(
        "flex min-h-[120px] flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div>
        <p className="text-xs font-medium text-[var(--text-muted)]">{label}</p>
        <p className="font-data mt-2 text-2xl font-semibold tracking-tight text-[var(--text-display)]">
          {value}
        </p>
        {trend && (
          <p className="mt-1 flex items-center gap-1 text-xs text-[var(--text-faint)]">
            <span aria-hidden>{trend.direction === "up" ? "↑" : "↓"}</span>
            {trend.label}
          </p>
        )}
      </div>
      <Sparkline points={points} className="mt-3 h-6 w-full opacity-40" stroke="#94a3b8" />
    </div>
  );
}
