import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "neo-inset-sm skeleton-shimmer rounded-2xl bg-[var(--surface)]",
        className,
      )}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="neo-raised-sm p-5">
      <Skeleton className="mb-3 h-3 w-24" />
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="neo-raised p-6">
      <Skeleton className="mb-4 h-5 w-40" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3", i === lines - 1 ? "w-2/3" : "mb-2 w-full")} />
      ))}
    </div>
  );
}
