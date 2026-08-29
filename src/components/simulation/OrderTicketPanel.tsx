import { cn } from "@/lib/utils";

interface OrderTicketPanelProps {
  title: string;
  price?: string;
  amount?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export function OrderTicketPanel({
  title,
  price,
  amount,
  children,
  className,
  footer,
}: OrderTicketPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm",
        className,
      )}
    >
      <h3 className="mb-4 text-sm font-semibold text-[var(--text-heading)]">{title}</h3>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Price</span>
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-3 py-2 font-data text-sm">
            {price ?? "—"}
          </div>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Amount</span>
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-3 py-2 font-data text-sm">
            {amount ?? "—"}
          </div>
        </label>
      </div>

      {children}
      {footer && <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">{footer}</div>}
    </div>
  );
}
