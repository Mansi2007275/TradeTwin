"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValueEvent } from "framer-motion";
import { getScoreBarColor, getScoreColor, getScoreRingColor, cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  label: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { ring: 72, stroke: 5, text: "text-xl" },
  md: { ring: 96, stroke: 6, text: "text-2xl" },
  lg: { ring: 120, stroke: 7, text: "text-3xl" },
};

export function ScoreRing({ score, label, size = "md" }: ScoreRingProps) {
  const { ring, stroke, text } = sizeMap[size];
  const radius = (ring - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const spring = useSpring(0, { duration: 800, bounce: 0 });
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    spring.set(score);
  }, [score, spring]);

  useMotionValueEvent(spring, "change", (v) => setAnimatedScore(v));

  const offset = circumference - (animatedScore / 100) * circumference;
  const ringColor = getScoreRingColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: ring, height: ring }}>
        <svg width={ring} height={ring} className="-rotate-90">
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            stroke="var(--surface-muted)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-data font-semibold tabular-nums", text, getScoreColor(score))}>
            {Math.round(animatedScore)}
          </span>
        </div>
      </div>
      <span className="type-eyebrow !text-[10px]">{label}</span>
    </div>
  );
}

interface ScoreBarProps {
  score: number;
  label: string;
  confidence?: number;
}

export function ScoreBar({ score, label, confidence }: ScoreBarProps) {
  const spring = useSpring(0, { duration: 600, bounce: 0 });
  const [width, setWidth] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    spring.set(score);
  }, [score, spring]);

  useMotionValueEvent(spring, "change", (v) => {
    setWidth(v);
    setDisplayScore(v);
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-[var(--text-heading)]">{label}</span>
        <div className="flex items-center gap-2">
          {confidence !== undefined && (
            <span className="text-xs text-[var(--text-muted)]">
              {Math.round(confidence * 100)}% conf.
            </span>
          )}
          <span className={cn("font-data font-semibold tabular-nums", getScoreColor(score))}>
            {Math.round(displayScore)}
          </span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <motion.div
          className={cn("h-full rounded-full bg-[var(--accent)]", getScoreBarColor(score))}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
