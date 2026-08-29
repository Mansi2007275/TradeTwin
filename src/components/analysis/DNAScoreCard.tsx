import type { DNAScoreResult } from "@/lib/dna/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ScoreBar, ScoreRing } from "@/components/ui/ScoreRing";
import { SectionEyebrow } from "@/components/ui/StatusIndicators";
import { MotionItem } from "@/components/motion/MotionStagger";

function scoreExplanation(score: DNAScoreResult): string {
  switch (score.id) {
    case "fomo":
      return score.score >= 60
        ? "You tend to enter shortly after significant price moves, suggesting FOMO-driven entries."
        : "You rarely chase pumps — entries are not strongly FOMO-driven.";
    case "risk":
      return score.score >= 60
        ? "Your position sizes are relatively large and concentrated compared to your portfolio."
        : "You keep position sizes relatively conservative.";
    case "patience":
      return score.score >= 60
        ? "You hold positions with reasonable patience, especially on winners."
        : "You exit winners quickly and hold losers longer — a patience imbalance.";
    case "momentum":
      return score.score >= 60
        ? "You strongly favour momentum and trend-following entry patterns."
        : "You don't heavily rely on momentum-style entries.";
    case "overtrading":
      return score.score >= 55
        ? "Your trade frequency spikes during volatile or post-loss periods."
        : "Your trading frequency stays relatively stable.";
    default:
      return "";
  }
}

export function DNAScoreOverview({ scores }: { scores: DNAScoreResult[] }) {
  return (
    <MotionItem>
      <Card padding="lg">
        <SectionEyebrow className="mb-6 text-center">Five-axis profile</SectionEyebrow>
        <div className="flex flex-wrap items-end justify-center gap-8 sm:gap-12">
          {scores.map((score) => (
            <ScoreRing
              key={score.id}
              score={score.score}
              label={score.label.replace(" Score", "")}
              size="sm"
            />
          ))}
        </div>
      </Card>
    </MotionItem>
  );
}

export function DNAScoreCard({ score }: { score: DNAScoreResult }) {
  return (
    <MotionItem>
      <Card variant="rack" padding="md" hover={false}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="type-display text-lg">{score.label}</h3>
              <span className="font-data text-sm text-[var(--text-faint)]">
                {Math.round(score.confidence * 100)}% conf
              </span>
              {score.lowConfidence && (
                <Badge variant="outline" className="!text-[10px]">
                  Low data
                </Badge>
              )}
            </div>

            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
              {scoreExplanation(score)}
            </p>

            <p className="mt-3 font-data text-[11px] text-[var(--text-faint)]">{score.formula}</p>

            <ul className="mt-4 space-y-2 border-t border-[var(--border-subtle)] pt-4">
              {score.evidence.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-xs leading-relaxed text-[var(--text-muted)]"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--text-faint)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full shrink-0 lg:w-44">
            <ScoreBar score={score.score} label="" confidence={score.confidence} />
          </div>
        </div>
      </Card>
    </MotionItem>
  );
}
