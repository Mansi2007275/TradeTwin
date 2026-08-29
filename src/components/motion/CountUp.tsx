"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface CountUpProps {
  value: number;
  className?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export function CountUp({
  value,
  className,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 0.5,
}: CountUpProps) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplay(latest.toFixed(decimals));
  });

  return (
    <motion.span className={cn("tabular-nums", className)}>
      {prefix}
      {display}
      {suffix}
    </motion.span>
  );
}

interface CountUpCurrencyProps {
  value: number;
  className?: string;
}

export function CountUpCurrency({ value, className }: CountUpCurrencyProps) {
  return <CountUp value={value} decimals={0} prefix="$" className={className} />;
}

interface CountUpPercentProps {
  value: number;
  className?: string;
  signed?: boolean;
}

export function CountUpPercent({
  value,
  className,
  signed = true,
}: CountUpPercentProps) {
  const prefix = signed && value > 0 ? "+" : "";
  return (
    <CountUp
      value={value}
      decimals={2}
      prefix={prefix}
      suffix="%"
      className={className}
    />
  );
}
