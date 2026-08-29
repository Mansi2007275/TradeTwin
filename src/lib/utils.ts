export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, signed = true): string {
  const prefix = signed && value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

export function formatVolume(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "text-[var(--error)]";
  if (score >= 40) return "text-[var(--warning)]";
  return "text-[var(--success)]";
}

export function getScoreBarColor(score: number): string {
  if (score >= 70) return "bg-[var(--error)]";
  if (score >= 40) return "bg-[var(--warning)]";
  return "bg-[var(--success)]";
}

export function getScoreRingColor(score: number): string {
  if (score >= 70) return "var(--error)";
  if (score >= 40) return "var(--warning)";
  return "var(--success)";
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
