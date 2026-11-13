"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { ArcadeButton } from "@/components/game/arcade-button";
import { CountdownRing } from "@/components/game/countdown-ring";
import { PhaseLabel } from "@/components/game/game-header";
import { PlayerGrid } from "@/components/game/player-grid";
import { Stepper } from "@/components/game/stepper";
import { api, ApiError } from "@/lib/client/api";
import { useCountdown } from "@/lib/realtime/use-countdown";
import { MAX_PREDICTION, MIN_PREDICTION } from "@/lib/scoring";
import type { GameSnapshot } from "@/types/game";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ?#%&";

/** The redacted topic: letters flicker but never resolve. */
function SecretTopic() {
  const [text, setText] = useState("??????");
  useEffect(() => {
    const id = setInterval(() => {
      const len = 6 + Math.floor(Math.random() * 4);
      setText(Array.from({ length: len }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join(""));
    }, 110);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative mx-auto w-fit overflow-hidden rounded-2xl border border-line-strong bg-night/80 px-6 py-3">
      <span className="font-mono text-2xl font-bold tracking-[0.35em] text-faint blur-[1.5px]">{text}</span>
      <span className="absolute inset-0 grid place-items-center">
        <span className="flex items-center gap-2 rounded-full bg-ink/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
          <Lock className="size-3.5" /> Topic sealed
        </span>
      </span>
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

      <AnimatePresence mode="wait">
        {locked === null ? (
          <motion.div
            key="bid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex w-full flex-col items-center"
          >
            <h1 className="mt-4 font-display text-[clamp(3rem,10vw,6.5rem)] font-black uppercase leading-[0.85]">
              How many
              <br />
              <span className="text-uv-glow">can you name?</span>
            </h1>
            <div className="mt-5">
              <SecretTopic />
            </div>
            <div className="mt-8">
              <Stepper value={bid} onChange={setBid} min={MIN_PREDICTION} max={MAX_PREDICTION} size="xl" label="your bid" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Hit it to score <b className="text-volt">{bid}</b>. Miss by one and it&apos;s <b className="text-hot">zero</b>.
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
