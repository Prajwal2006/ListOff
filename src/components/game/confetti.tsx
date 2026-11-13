"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Pure hash-based pseudo-random in [0, 1) so render stays deterministic. */
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const COLORS = ["#c8ff2e", "#8b5cff", "#2ee6ff", "#ff4d7e", "#ffc23d", "#ffffff"];

/** A one-shot burst of tally-stroke confetti. Mount it to fire; it cleans up by itself visually. */
export function Confetti({ count = 70, origin = "top" }: { count?: number; origin?: "top" | "center" }) {
  const reduced = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (rnd(i, 1) - 0.5) * 120,
        y: origin === "top" ? 60 + rnd(i, 2) * 50 : (rnd(i, 2) - 0.5) * 90,
        rot: rnd(i, 3) * 720 - 360,
        delay: rnd(i, 4) * 0.25,
        dur: 1.6 + rnd(i, 5) * 1.4,
        w: 4 + rnd(i, 6) * 4,
        h: 12 + rnd(i, 7) * 14,
        color: COLORS[i % COLORS.length],
      })),
    [count, origin],
  );
  if (reduced) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 rounded-full"
          style={{ top: origin === "top" ? "-4%" : "45%", width: p.w, height: p.h, background: p.color }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: `${p.x}vw`, y: `${p.y}vh`, rotate: p.rot, opacity: [1, 1, 0] }}
          transition={{ duration: p.dur, delay: p.delay, ease: [0.15, 0.6, 0.35, 1] }}
        />
      ))}
    </div>
  );
}
