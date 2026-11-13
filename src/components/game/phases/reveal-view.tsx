"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CategoryIcon } from "@/components/game/category-icon";
import { useCountdown } from "@/lib/realtime/use-countdown";
import type { PublicTopic } from "@/types/game";

const DIFFICULTY = { easy: "text-volt", medium: "text-amber", hard: "text-hot" } as const;

/** The drop: the topic slams in, then a 3-2-1 before the clock starts. */
export function RevealView({
  topic,
  answeringStartsAt,
  offset,
  bid,
  roundNumber,
}: {
  topic: PublicTopic;
  answeringStartsAt: number | null;
  offset: number;
  bid?: number | null;
  roundNumber: number;
}) {
  const { msLeft } = useCountdown(answeringStartsAt, offset, 50);
  const count = Math.ceil(msLeft / 1000);
  return (
    <div className="relative flex min-h-[70dvh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0.35] }}
        transition={{ duration: 1.1 }}
        style={{ background: "radial-gradient(circle at 50% 45%, rgb(200 255 46 / 0.25), transparent 60%)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 rounded-full border border-line-strong bg-night/80 px-4 py-1.5 text-sm font-semibold"
      >
        <CategoryIcon name={topic.categoryIcon} className="size-4 text-cyan" />
        {topic.categoryName}
        <span className={`text-xs font-bold uppercase ${DIFFICULTY[topic.difficulty]}`}>· {topic.difficulty}</span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.8em" }}
        animate={{ opacity: 1, letterSpacing: "0.3em" }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="mt-8 text-sm font-bold uppercase text-cyan sm:text-base"
      >
        Round {roundNumber} · name as many
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, scale: 2.6, filter: "blur(18px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ delay: 0.35, type: "spring", stiffness: 140, damping: 14 }}
        className="mt-2 max-w-5xl font-display text-[clamp(3.2rem,13vw,10rem)] font-black uppercase leading-[0.85] text-volt-glow"
      >
        {topic.name}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-4 max-w-xl text-lg text-muted-foreground"
      >
        {topic.prompt}.{bid ? (
          <>
            {" "}
            You bid <b className="text-uv-soft">{bid}</b>.
          </>
        ) : null}
      </motion.p>

      <div className="mt-10 h-28">
        <AnimatePresence mode="popLayout">
          {count > 0 && count <= 3 && (
            <motion.span
              key={count}
              initial={{ scale: 2.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="block font-display text-8xl font-black tabular text-text"
            >
              {count}
            </motion.span>
          )}
          {count === 0 && (
            <motion.span
              key="go"
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="block font-display text-8xl font-black uppercase text-volt"
            >
              Go!
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
