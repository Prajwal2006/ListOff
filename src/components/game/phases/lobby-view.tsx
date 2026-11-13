"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PlayerGrid } from "@/components/game/player-grid";
import { PhaseLabel } from "@/components/game/game-header";
import type { GameSnapshot } from "@/types/game";

export function LobbyView({ snapshot }: { snapshot: GameSnapshot }) {
  const { game, participants, me } = snapshot;
  useJoinToasts(snapshot, me?.id);
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="py-6 text-center sm:py-10">
        <PhaseLabel>Lobby{game.hostName ? ` · hosted by ${game.hostName}` : ""}</PhaseLabel>
        <h1 className="mt-2 font-display text-5xl font-black uppercase leading-none sm:text-7xl">{game.name}</h1>
        <p className="mt-4 text-muted-foreground">
          {game.totalRounds} rounds · {game.roundDuration}s to answer · bids before every topic
        </p>
        <div className="mx-auto mt-8 flex w-fit items-center gap-3 rounded-full border border-line-strong bg-night/70 px-5 py-3">
          <span className="relative flex size-3">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-volt opacity-60" />
            <span className="relative inline-flex size-3 rounded-full bg-volt" />
          </span>
          <span className="font-display text-xl font-extrabold uppercase tracking-wide">Waiting for the host to start</span>
        </div>
      </motion.div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-extrabold uppercase">Players</h2>
        <span className="font-display text-2xl font-black tabular text-volt">{participants.length}</span>
      </div>
      <PlayerGrid players={participants} meId={me?.id} />
      <p className="mt-8 text-center text-sm text-faint">
        Tip: when the round starts you&apos;ll bid first — before you know the topic.
      </p>
    </div>
  );
}

/** Pop a small toast whenever someone new walks into the lobby. */
export function useJoinToasts(snapshot: GameSnapshot | null, meId?: string | null) {
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!snapshot) return;
    const ids = snapshot.participants.map((p) => p.id);
    if (seen.current === null) {
      seen.current = new Set(ids);
      return;
    }
    for (const p of snapshot.participants) {
      if (!seen.current.has(p.id)) {
        seen.current.add(p.id);
        if (p.id !== meId) toast(`${p.displayName} joined`, { duration: 1800 });
      }
    }
  }, [snapshot, meId]);
}
