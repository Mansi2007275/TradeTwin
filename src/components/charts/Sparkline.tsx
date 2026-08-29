export function Sparkline({
  points,
  className,
  stroke = "rgba(255,255,255,0.9)",
}: {
  points: number[];
  className?: string;
  stroke?: string;
}) {
  if (points.length < 2) return null;

  const w = 120;
  const h = 32;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coords.join(" ")}
      />
    </svg>
  );
}

/** Visual-only sparkline seed from a numeric stat (display helper). */
export function sparklineFromValue(value: number, length = 10): number[] {
  const base = Math.max(1, Math.abs(value));
  return Array.from({ length }, (_, i) => {
    const wave = Math.sin((i + base) * 0.7) * 0.15;
    const trend = (i / length) * 0.1;
    return base * (0.85 + wave + trend);
  });
}
