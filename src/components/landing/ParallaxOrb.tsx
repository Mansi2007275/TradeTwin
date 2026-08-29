"use client";

import { motion, type MotionValue, useTransform } from "framer-motion";

interface ParallaxOrbProps {
  className: string;
  drift: {
    x: readonly number[];
    y: readonly number[];
    scale: readonly number[];
  };
  duration: number;
  parallax: number;
  springX: MotionValue<number>;
  springY: MotionValue<number>;
}

function ParallaxOrb({
  className,
  drift,
  duration,
  parallax,
  springX,
  springY,
}: ParallaxOrbProps) {
  const x = useTransform(springX, (value) => value * parallax);
  const y = useTransform(springY, (value) => value * parallax);

  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      style={{ x, y }}
      animate={{
        x: [...drift.x],
        y: [...drift.y],
        scale: [...drift.scale],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export { ParallaxOrb };
