import { cn } from "@/lib/utils";

export function Spinner({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };
  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-[var(--shadow-dark)] border-t-[var(--accent)]",
        sizes[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function LoadingBlock({
  label = "Loading...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12", className)}>
      <Spinner size="lg" />
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
    </div>
  );
}
