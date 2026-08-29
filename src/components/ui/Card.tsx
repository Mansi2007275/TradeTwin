"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
  variant?: "default" | "hero" | "rack" | "ghost" | "yellow" | "coral" | "indigo";
}

const paddingMap = {
  sm: "p-5",
  md: "p-6",
  lg: "p-8",
};

const variantMap = {
  default: "surface-panel",
  hero: "surface-panel-hero relative overflow-hidden",
  rack: "surface-rack",
  ghost: "surface-ghost",
  yellow: "surface-rack bg-[var(--brutal-yellow)]",
  coral: "surface-rack bg-[var(--brutal-coral)] text-white",
  indigo: "surface-rack bg-[var(--brutal-blue)] text-[var(--ink)]",
};

export function Card({
  children,
  className,
  padding = "md",
  hover = true,
  variant = "default",
}: CardProps) {
  return (
    <motion.div
      whileHover={
        hover && variant !== "ghost"
          ? { x: -2, y: -2, transition: { duration: 0.1 } }
          : undefined
      }
      className={cn(
        "transition-[transform,box-shadow]",
        variantMap[variant],
        hover && variant === "default" && "neo-hover",
        paddingMap[padding],
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        {eyebrow && <p className="type-eyebrow mb-1">{eyebrow}</p>}
        <h3 className="type-display text-xl sm:text-2xl">{title}</h3>
        {subtitle && (
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
