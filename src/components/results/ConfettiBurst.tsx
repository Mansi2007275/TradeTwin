"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

const COLORS = ["#5b6eae", "#38a169", "#d69e2e", "#718096", "#e8ebf8"];

export function ConfettiBurst({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const next = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 280,
      y: -(Math.random() * 120 + 40),
      color: COLORS[i % COLORS.length],
      size: 4 + Math.random() * 6,
    }));
    setParticles(next);
    const t = setTimeout(() => setParticles([]), 900);
    return () => clearTimeout(t);
  }, [active]);

  if (!particles.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
