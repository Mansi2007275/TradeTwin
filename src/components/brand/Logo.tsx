"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
  animated?: boolean;
  /** Light wordmark styling for dark backgrounds (sidebar only). */
  variant?: "default" | "onDark";
}

const sizeMap = {
  sm: { box: "h-9 w-9", icon: 26, text: "text-base" },
  md: { box: "h-10 w-10", icon: 30, text: "text-lg" },
  lg: { box: "h-20 w-20", icon: 50, text: "text-2xl" },
  xl: { box: "h-28 w-28", icon: 68, text: "text-3xl" },
};

export function Logo({
  size = "md",
  showWordmark = true,
  className,
  animated = false,
  variant = "default",
}: LogoProps) {
  const { box, icon, text } = sizeMap[size];

  const mark = (
    <div
      className={cn(
        "logo-mark flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-white shadow-sm",
        box,
      )}
    >
      <Image
        src="/tradetwin-logo.svg"
        alt="TradeTwin"
        width={icon}
        height={icon}
        priority={size === "xl"}
        className="select-none"
      />
    </div>
  );

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        variant === "onDark" && "logo--on-dark",
        className,
      )}
    >
      {animated ? (
        <motion.div
          initial={{ scale: 0.85, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {mark}
        </motion.div>
      ) : (
        mark
      )}
      {showWordmark && (
        <span className={cn("logo-wordmark type-display !normal-case", text)}>
          Trade
          <span
            className={cn(
              variant === "onDark" ? "logo-wordmark-accent" : "text-[var(--accent)]",
            )}
          >
            Twin
          </span>
        </span>
      )}
    </div>
  );
}

export function LogoMark({
  size = "md",
  className,
}: {
  size?: LogoProps["size"];
  className?: string;
}) {
  return <Logo size={size} showWordmark={false} className={className} />;
}
