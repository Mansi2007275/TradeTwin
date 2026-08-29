import type { MetricResult } from "@/lib/analysis/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatMetricValue } from "@/lib/analysis/format";
import { MotionItem } from "@/components/motion/MotionStagger";

export function MetricCard({ metric }: { metric: MetricResult }) {
  return (
    <MotionItem>
      <Card variant="rack" padding="sm" hover={false}>
        <div className="flex items-start justify-between gap-2">
          <p className="type-eyebrow">{metric.label}</p>
          {metric.insufficientData && (
            <Badge variant="outline" className="!text-[10px]">
              Low data
            </Badge>
          )}
        </div>
        <p className="font-data mt-3 text-xl font-semibold tabular-nums text-[var(--text-display)]">
          {formatMetricValue(metric)}
        </p>
        <p className="mt-2 text-xs text-[var(--text-faint)]">
          {Math.round(metric.confidence * 100)}% confidence · n={metric.sampleSize}
        </p>
      </Card>
    </MotionItem>
  );
}

export function MetricSection({
  title,
  metrics,
}: {
  title: string;
  metrics: MetricResult[];
}) {
  return (
    <div>
      <h3 className="type-eyebrow mb-4">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <MetricCard key={m.label} metric={m} />
        ))}
      </div>
    </div>
  );
}
