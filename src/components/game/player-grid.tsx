"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicParticipant } from "@/types/game";
import { Avatar } from "./avatar";

export function PlayerGrid({
  players,
  meId,
  showPredicted = false,
  extra,
}: {
  players: PublicParticipant[];
  meId?: string | null;
  showPredicted?: boolean;
  extra?: (p: PublicParticipant) => React.ReactNode;
}) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      <AnimatePresence initial={false}>
        {players.map((p) => {
          const me = p.id === meId;
          return (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className={cn(
                "relative flex items-center gap-2.5 rounded-2xl border bg-night/70 p-2.5 pr-3",
                me ? "border-volt/60 shadow-[0_0_24px_rgb(200_255_46/0.15)]" : "border-line",
              )}
            >
              <span className="relative">
                <Avatar name={p.displayName} avatar={p.avatar} size="sm" dim={!p.isConnected} />
                {showPredicted && p.hasPredicted && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-volt text-[#0a0d00]"
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </motion.span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold leading-tight">
                  {p.displayName}
                  {me && <span className="ml-1 text-xs font-bold uppercase text-volt">you</span>}
                </span>
                {!p.isConnected && <span className="text-xs text-faint">reconnecting…</span>}
              </span>
              {extra?.(p)}
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
