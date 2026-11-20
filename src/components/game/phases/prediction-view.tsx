"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock } from "lucide-react";
import { CategoryIcon } from "@/components/game/category-icon";
import { toast } from "sonner";
import { ArcadeButton } from "@/components/game/arcade-button";
import { CountdownRing } from "@/components/game/countdown-ring";
import { PhaseLabel } from "@/components/game/game-header";
import { PlayerGrid } from "@/components/game/player-grid";
import { Stepper } from "@/components/game/stepper";
import { api, ApiError } from "@/lib/client/api";
import { useCountdown } from "@/lib/realtime/use-countdown";
import { calculatePoints, MAX_PREDICTION, MIN_PREDICTION } from "@/lib/scoring";
import type { GameSnapshot } from "@/types/game";

const DIFFICULTY = { easy: "text-volt", medium: "text-amber", hard: "text-hot" } as const;

/** The topic, slammed in at the top of the bid screen. */
function TopicCard({ topic }: { topic: NonNullable<NonNullable<GameSnapshot["round"]>["topic"]> }) {
  return (
    <div className="relative mt-4 w-full overflow-hidden rounded-3xl border border-line-strong bg-night/70 px-5 py-6">
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.5] }}
        transition={{ duration: 1.2 }}
        style={{ background: "radial-gradient(circle at 50% 50%, rgb(200 255 46 / 0.2), transparent 70%)" }}
      />
      <div className="relative flex items-center justify-center gap-2 text-sm font-semibold">
        <CategoryIcon name={topic.categoryIcon} className="size-4 text-cyan" />
        {topic.categoryName}
        <span className={`text-xs font-bold uppercase ${DIFFICULTY[topic.difficulty]}`}>· {topic.difficulty}</span>
      </div>
      <p className="relative mt-3 text-xs font-bold uppercase tracking-[0.3em] text-cyan">Name as many</p>
      <motion.h2
        initial={{ opacity: 0, scale: 2, filter: "blur(14px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
        className="relative font-display text-[clamp(2.8rem,10vw,6rem)] font-black uppercase leading-[0.85] text-volt-glow"
      >
        {topic.name}
      </motion.h2>
      <p className="relative mt-2 text-sm text-muted-foreground">{topic.prompt}.</p>
    </div>
  );
}

export function PredictionView({
  snapshot,
  token,
  offset,
  onLocked,
}: {
  snapshot: GameSnapshot;
  token: string;
  offset: number;
  onLocked: () => void;
}) {
  const round = snapshot.round!;
  const myBid = snapshot.me?.round?.prediction ?? null;
  const [bid, setBid] = useState(5);
  const [busy, setBusy] = useState(false);
  const [optimistic, setOptimistic] = useState<number | null>(null);
  const { msLeft } = useCountdown(round.predictionDeadline, offset);
  const totalMs = snapshot.game.predictionDuration * 1000;
  const locked = myBid ?? optimistic;

  async function lock() {
    setBusy(true);
    setOptimistic(bid);
    try {
      await api.predict(snapshot.game.code, token, bid);
      onLocked();
    } catch (e) {
      if (!(e instanceof ApiError && e.code === "CONFLICT")) setOptimistic(null);
      toast.error(e instanceof ApiError ? e.message : "Couldn't lock your bid.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-12 text-center sm:px-6">
      <div className="flex w-full items-center justify-between pt-2">
        <PhaseLabel tone="uv">Round {round.number} · place your bid</PhaseLabel>
        <CountdownRing msLeft={msLeft} totalMs={totalMs} size={64} />
      </div>

      {round.topic && <TopicCard topic={round.topic} />}

      <AnimatePresence mode="wait">
        {locked === null ? (
          <motion.div
            key="bid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex w-full flex-col items-center"
          >
            <h1 className="mt-6 font-display text-4xl font-black uppercase leading-[0.9] sm:text-5xl">
              How many <span className="text-uv-glow">can you name?</span>
            </h1>
            <div className="mt-5">
              <Stepper value={bid} onChange={setBid} min={MIN_PREDICTION} max={MAX_PREDICTION} size="xl" label="your bid" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Hit it for <b className="text-volt">{calculatePoints(bid, bid)}+</b> points (2 per answer, +1 for every extra).
              Fall short and it&apos;s <b className="text-hot">zero</b>.
            </p>
            <ArcadeButton variant="uv" size="xl" className="mt-6 w-full max-w-sm" onClick={lock} loading={busy}>
              <Lock className="size-6" /> Lock in {bid}
            </ArcadeButton>
          </motion.div>
        ) : (
          <motion.div
            key="locked"
            initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 16 }}
            className="mt-8 flex flex-col items-center"
          >
            <p className="font-display text-2xl font-extrabold uppercase text-muted-foreground">Your bid</p>
            <div className="mt-3 grid size-44 place-items-center rounded-[2.5rem] bg-uv font-display text-[8rem] font-black leading-none text-white shadow-[0_10px_0_#4a1fd1,0_0_90px_rgb(139_92_255/0.55)]">
              {locked}
            </div>
            <p className="mt-6 flex items-center gap-2 font-display text-xl font-extrabold uppercase tracking-wide">
              <Lock className="size-5 text-uv-soft" /> Locked. No take-backs.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10 w-full">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Bids locked</span>
          <span className="font-display text-2xl font-black tabular">
            <span className="text-volt">{round.predictionsIn}</span>
            <span className="text-faint">/{round.eligible}</span>
          </span>
        </div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-line">
          <motion.div
            className="h-full rounded-full bg-volt"
            animate={{ width: `${round.eligible ? (round.predictionsIn / round.eligible) * 100 : 0}%` }}
          />
        </div>
        <PlayerGrid players={snapshot.participants} meId={snapshot.me?.id} showPredicted />
      </div>
    </div>
  );
}
