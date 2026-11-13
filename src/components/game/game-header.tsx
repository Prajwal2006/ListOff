"use client";

import { Wifi, WifiOff } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import type { GameSnapshot } from "@/types/game";

export function GameHeader({
  snapshot,
  connected,
  right,
}: {
  snapshot: GameSnapshot | null;
  connected: boolean;
  right?: React.ReactNode;
}) {
  const g = snapshot?.game;
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <Logo size="sm" href={null} />
      <div className="flex items-center gap-2 sm:gap-3">
        {g && g.currentRound > 0 && g.state !== "GAME_FINISHED" && (
          <span className="rounded-full border border-line-strong bg-night/70 px-3 py-1 font-display text-sm font-extrabold uppercase tracking-wider">
            Round {g.currentRound}
            <span className="text-faint">/{g.totalRounds}</span>
          </span>
        )}
        {g && (
          <span className="hidden rounded-full border border-line bg-night/50 px-3 py-1 font-mono text-xs tracking-[0.3em] text-muted-foreground sm:inline">
            {g.code}
          </span>
        )}
        <span
          title={connected ? "Connected" : "Reconnecting…"}
          className={cn(
            "grid size-8 place-items-center rounded-full border",
            connected ? "border-volt/30 text-volt" : "border-hot/40 text-hot animate-pulse",
          )}
        >
          {connected ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
          <span className="sr-only">{connected ? "Connected" : "Reconnecting"}</span>
        </span>
        {right}
      </div>
    </header>
  );
}

export function PhaseLabel({ children, tone = "cyan" }: { children: React.ReactNode; tone?: "cyan" | "volt" | "uv" | "hot" }) {
  const c = { cyan: "text-cyan", volt: "text-volt", uv: "text-uv-soft", hot: "text-hot" }[tone];
  return <p className={cn("text-xs font-bold uppercase tracking-[0.3em]", c)}>{children}</p>;
}
