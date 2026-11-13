"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Five tally strokes — four uprights and the slash that closes the group. */
export function TallyGlyph({ className, animate = false }: { className?: string; animate?: boolean }) {
  const strokes = [
    "M6 4 L6 28",
    "M13 4 L13 28",
    "M20 4 L20 28",
    "M27 4 L27 28",
    "M1 24 L32 8",
  ];
  return (
    <svg viewBox="0 0 33 32" className={cn("h-7 w-7", className)} aria-hidden>
      {strokes.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          stroke={i === 4 ? "var(--volt)" : "currentColor"}
          strokeWidth={i === 4 ? 4 : 3.4}
          strokeLinecap="round"
          fill="none"
          initial={animate ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: animate ? 0.15 + i * 0.12 : 0, duration: 0.35, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

export function Logo({ size = "md", href = "/" }: { size?: "sm" | "md" | "lg"; href?: string | null }) {
  const text = { sm: "text-2xl", md: "text-3xl", lg: "text-6xl sm:text-7xl" }[size];
  const glyph = { sm: "h-6 w-6", md: "h-7 w-7", lg: "h-14 w-14 sm:h-16 sm:w-16" }[size];
  const inner = (
    <span className="inline-flex items-center gap-2 select-none">
      <TallyGlyph className={cn(glyph, "text-text")} animate={size === "lg"} />
      <span className={cn("font-display font-black uppercase leading-none tracking-tight", text)}>
        List<span className="text-volt">Off</span>
      </span>
    </span>
  );
  if (!href) return inner;
  return (
    <Link href={href} className="rounded-lg" aria-label="ListOff home">
      {inner}
    </Link>
  );
}
