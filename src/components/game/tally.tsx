"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Tally marks: the signature visual of ListOff. Every valid answer draws a stroke; every fifth
 * slashes the group. Strokes past the player's bid glow volt.
 */
export function Tally({
  count,
  target,
  className,
  strokeClassName,
  max = 60,
}: {
  count: number;
  target?: number | null;
  className?: string;
  strokeClassName?: string;
  max?: number;
}) {
  const shown = Math.min(count, max);
  const groups = Math.ceil(shown / 5);
  return (
    <div className={cn("flex flex-wrap items-end gap-x-3 gap-y-2", className)} aria-label={`${count} tallied`}>
      {Array.from({ length: groups }, (_, g) => {
        const inGroup = Math.min(5, shown - g * 5);
        return (
          <svg key={g} viewBox="0 0 40 36" className="h-9 w-10 overflow-visible">
            {Array.from({ length: inGroup }, (_, i) => {
              const n = g * 5 + i + 1;
              const over = target ? n > target : false;
              const met = target ? n === target : false;
              const slash = i === 4;
              return (
                <motion.path
                  key={i}
                  d={slash ? "M2 28 L38 8" : `M${7 + i * 8.5} 3 L${7 + i * 8.5} 33`}
                  fill="none"
                  strokeLinecap="round"
                  strokeWidth={slash ? 4.2 : 3.6}
                  className={cn(
                    strokeClassName,
                    met ? "stroke-volt" : over ? "stroke-volt/70" : slash ? "stroke-uv-soft" : "stroke-text",
                  )}
                  style={met ? { filter: "drop-shadow(0 0 6px rgb(200 255 46 / 0.9))" } : undefined}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                />
              );
            })}
          </svg>
        );
      })}
    </div>
  );
}
