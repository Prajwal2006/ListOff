"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Crown, Minus } from "lucide-react";
import { Avatar } from "@/components/game/avatar";
import { cn } from "@/lib/utils";
import type { ScoreRow } from "@/types/game";

/**
 * Leaderboard that first renders the *previous* standings, then re-sorts to the new ones so
 * players watch themselves climb (or slide). Scores count up as rows move.
 */
export function Leaderboard({
  rows,
  meId,
  animateFromPrevious = true,
  showRound = true,
  compact = false,
  animationKey,
}: {
  rows: ScoreRow[];
  meId?: string | null;
  animateFromPrevious?: boolean;
  showRound?: boolean;
  compact?: boolean;
  /** Re-run the climb animation only when this changes (e.g. the round number). */
  animationKey?: string | number;
}) {
  const [settledKey, setSettledKey] = useState<string | number | null>(null);
  const key = animationKey ?? "default";
  const settled = !animateFromPrevious || settledKey === key;
  useEffect(() => {
    if (!animateFromPrevious) return;
    const t = setTimeout(() => setSettledKey(key), 900);
    return () => clearTimeout(t);
  }, [animateFromPrevious, key]);

  const ordered = settled
    ? rows
    : [...rows].sort(
        (a, b) => (a.previousRank ?? a.rank) - (b.previousRank ?? b.rank) || a.displayName.localeCompare(b.displayName),
      );

  return (
    <ol className="space-y-2">
      {ordered.map((r) => {
        const me = r.participantId === meId;
        const moved = r.previousRank !== null ? r.previousRank - r.rank : 0;
        const rank = settled ? r.rank : (r.previousRank ?? r.rank);
        return (
          <motion.li
            key={r.participantId}
            layout
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className={cn(
              "flex items-center gap-3 rounded-2xl border bg-night/75 px-3",
              compact ? "py-2" : "py-3",
              me ? "border-volt/60 bg-volt/[0.06]" : "border-line",
              rank === 1 && settled && "border-amber/50",
            )}
          >
            <span
              className={cn(
                "w-9 text-center font-display text-2xl font-black tabular",
                rank === 1 ? "text-amber" : rank === 2 ? "text-[#d6dcff]" : rank === 3 ? "text-[#ffb08a]" : "text-faint",
              )}
            >
              {rank === 1 && settled && r.totalScore > 0 ? <Crown className="mx-auto size-6" /> : rank}
            </span>
            <Avatar name={r.displayName} avatar={r.avatar} size={compact ? "sm" : "md"} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">
                {r.displayName}
                {me && <span className="ml-1.5 text-xs font-bold uppercase text-volt">you</span>}
              </span>
              {showRound && r.predictedCount !== null && (
                <span className="text-xs text-muted-foreground">
                  bid {r.predictedCount} · got {r.validCount}
                </span>
              )}
            </span>
            {settled && moved !== 0 ? (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn("flex items-center text-xs font-bold", moved > 0 ? "text-volt" : "text-hot")}
              >
                {moved > 0 ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
                {Math.abs(moved)}
              </motion.span>
            ) : (
              settled && <Minus className="size-3.5 text-faint" />
            )}
            {showRound && (
              <span
                className={cn(
                  "min-w-12 rounded-lg px-2 py-1 text-center font-display text-lg font-extrabold tabular",
                  r.roundPoints > 0 ? "bg-volt/15 text-volt" : "bg-deck text-faint",
                )}
              >
                +{r.roundPoints}
              </span>
            )}
            <CountUp
              value={settled ? r.totalScore : r.totalScore - r.roundPoints}
              className="w-14 text-right font-display text-3xl font-black tabular"
            />
          </motion.li>
        );
      })}
    </ol>
  );
}

export function CountUp({ value, className }: { value: number; className?: string }) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (shown === value) return;
    const start = shown;
    const diff = value - start;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 600);
      setShown(Math.round(start + diff * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span className={className}>{shown}</span>;
}
