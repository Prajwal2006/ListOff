"use client";

import { motion } from "framer-motion";
import { TallyGlyph } from "@/components/brand/logo";

export function ProcessingView({ label = "Tallying the room" }: { label?: string }) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 px-4 text-center">
      <motion.div
        animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="text-text"
      >
        <TallyGlyph className="size-28" animate />
      </motion.div>
      <p className="shimmer-text font-display text-5xl font-black uppercase sm:text-6xl">{label}</p>
      <p className="text-muted-foreground">Checking every answer against the list…</p>
    </div>
  );
}
