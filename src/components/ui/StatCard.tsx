"use client";

import { cn } from "@/lib/utils";
import { CountUp, CountUpCurrency, CountUpPercent } from "@/components/motion/CountUp";
import { MotionItem } from "@/components/motion/MotionStagger";
import { SectionEyebrow } from "@/components/ui/StatusIndicators";
import { formatPercent } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
  numericValue?: number;
  isPercent?: boolean;
  isCurrency?: boolean;
  suffix?: string;
  variant?: "default" | "rack";
}

export function StatCard({
  label,
  value,
  subValue,
  trend,
  className,
  numericValue,
  isPercent,
  isCurrency,
  suffix,
  variant = "default",
}: StatCardProps) {
  const isRack = variant === "rack";

  return (
    <MotionItem>
      <div
        className={cn(
          isRack ? "surface-rack px-4 py-4" : "surface-panel px-5 py-5 neo-hover transition-shadow",
          className,
        )}
      >
        <SectionEyebrow className="mb-3">{label}</SectionEyebrow>
        <p
          className={cn(
            "font-data font-semibold tabular-nums tracking-tight text-[var(--text-display)]",
            isRack ? "text-xl" : "text-2xl",
          )}
        >
          {numericValue !== undefined ? (
            isCurrency ? (
              <CountUpCurrency value={numericValue} />
            ) : isPercent ? (
              <CountUpPercent value={numericValue} />
            ) : (
              <CountUp value={numericValue} decimals={0} suffix={suffix} />
            )
          ) : (
            value
          )}
        </p>
        {subValue && (
          <p
            className={cn(
              "mt-2 text-xs leading-relaxed",
              trend === "up" && "text-[var(--success)]",
              trend === "down" && "text-[var(--error)]",
              (!trend || trend === "neutral") && "text-[var(--text-faint)]",
            )}
          >
            {subValue}
          </p>
        )}
      </div>
    </MotionItem>
  );
}

interface MarketStatProps {
  label: string;
  value: string;
}

export function MarketStat({ label, value }: MarketStatProps) {
  return (
    <div className="surface-inset px-4 py-3">
      <SectionEyebrow>{label}</SectionEyebrow>
      <p className="font-data text-sm font-semibold tabular-nums text-[var(--text-heading)]">
        {value}
      </p>
    </div>
  );
}

export function PortfolioStat({
  label,
  value,
  change,
}: {
  label: string;
  value: number;
  change?: number;
}) {
  return (
    <StatCard
      label={label}
      value=""
      numericValue={value}
      isCurrency
      variant="rack"
      subValue={change !== undefined ? formatPercent(change) : undefined}
      trend={change === undefined ? "neutral" : change >= 0 ? "up" : "down"}
    />
  );
}
