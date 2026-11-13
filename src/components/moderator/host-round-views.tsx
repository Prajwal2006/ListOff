"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, Copy, Lock, X } from "lucide-react";
import { AnswerKey } from "@/components/game/answer-key";
import { Avatar } from "@/components/game/avatar";
import { CountdownRing } from "@/components/game/countdown-ring";
import { PhaseLabel } from "@/components/game/game-header";
import { PlayerGrid } from "@/components/game/player-grid";
import { Leaderboard } from "@/components/leaderboard/leaderboard";
import { useCountdown } from "@/lib/realtime/use-countdown";
import { cn } from "@/lib/utils";
import type { GameSnapshot } from "@/types/game";

export function HostPrediction({ snapshot, offset }: { snapshot: GameSnapshot; offset: number }) {
  const round = snapshot.round!;
  const { msLeft } = useCountdown(round.predictionDeadline, offset);
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <PhaseLabel tone="uv">Round {round.number} · bidding</PhaseLabel>
          <h2 className="mt-1 font-display text-5xl font-black uppercase leading-none sm:text-7xl">How many can you name?</h2>
          <p className="mt-3 flex items-center justify-center gap-2 text-muted-foreground sm:justify-start">
            <Lock className="size-4" /> The topic is sealed until bids lock — even from you.
          </p>
        </div>
        <CountdownRing msLeft={msLeft} totalMs={snapshot.game.predictionDuration * 1000} size={130} label="bids" />
      </div>
      <div className="panel p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="font-display text-2xl font-extrabold uppercase">Bids locked</span>
          <span className="font-display text-4xl font-black tabular">
            <span className="text-volt">{round.predictionsIn}</span>
            <span className="text-faint">/{round.eligible}</span>
          </span>
        </div>
        <PlayerGrid players={snapshot.participants} showPredicted />
      </div>
    </div>
  );
}

export function HostAnswering({ snapshot, offset }: { snapshot: GameSnapshot; offset: number }) {
  const round = snapshot.round!;
  const topic = round.topic!;
  const { msLeft } = useCountdown(round.answeringDeadline, offset);
  const counts = snapshot.moderator?.answerCounts ?? {};
  const preds = new Map((snapshot.moderator?.predictions ?? []).map((p) => [p.participantId, p.predictedCount]));
  const maxCount = Math.max(5, ...Object.values(counts));
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="min-w-0">
          <PhaseLabel>Round {round.number} · {topic.categoryName} · {topic.totalAnswers} answers on the list</PhaseLabel>
          <h2 className="mt-1 font-display text-[clamp(3rem,9vw,7rem)] font-black uppercase leading-[0.85] text-volt-glow">{topic.name}</h2>
          <p className="mt-2 text-muted-foreground">{topic.prompt}</p>
        </div>
        <CountdownRing msLeft={msLeft} totalMs={snapshot.game.roundDuration * 1000} size={150} label="sec" />
      </div>
      <div className="panel space-y-2 p-5">
        <h3 className="mb-2 font-display text-xl font-extrabold uppercase text-muted-foreground">Answers entered (live)</h3>
        {snapshot.participants.map((p) => {
          const n = counts[p.id] ?? 0;
          const bid = preds.get(p.id);
          return (
            <div key={p.id} className="flex items-center gap-3">
              <Avatar name={p.displayName} avatar={p.avatar} size="sm" dim={!p.isConnected} />
              <span className="w-28 truncate text-sm font-semibold sm:w-40">{p.displayName}</span>
              <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-line">
                <motion.div
                  className="h-full rounded-lg bg-gradient-to-r from-uv to-cyan"
                  animate={{ width: `${(n / maxCount) * 100}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                />
                {bid !== undefined && (
                  <span
                    className="absolute inset-y-0 w-0.5 bg-volt"
                    style={{ left: `${Math.min(100, (bid / maxCount) * 100)}%` }}
                    title={`bid ${bid}`}
                  />
                )}
              </div>
              <span className="w-16 text-right font-display text-xl font-black tabular">
                {n}
                {bid !== undefined && <span className="text-sm text-faint">/{bid}</span>}
              </span>
            </div>
          );
        })}
        <p className="pt-2 text-xs text-faint">Bars show entries submitted; the green line marks each player&apos;s bid. Validity is revealed after the buzzer.</p>
      </div>
    </div>
  );
}

export function HostResults({ snapshot }: { snapshot: GameSnapshot }) {
  const results = snapshot.results!;
  const answers = snapshot.moderator?.answers ?? [];
  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <PhaseLabel tone="volt">Round {results.roundNumber} results · {results.topic.categoryName}</PhaseLabel>
        <h2 className="mt-1 font-display text-5xl font-black uppercase leading-none sm:text-7xl">{results.topic.name}</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section>
          <h3 className="mb-3 font-display text-2xl font-extrabold uppercase">Leaderboard</h3>
          <Leaderboard rows={results.scores} animationKey={results.roundNumber} />
        </section>
        <section className="panel p-4">
          <h3 className="mb-3 font-display text-2xl font-extrabold uppercase">Every answer</h3>
          <div className="space-y-2">
            {answers.map((a) => (
              <PlayerAnswers key={a.participantId} entry={a} score={results.scores.find((s) => s.participantId === a.participantId)} />
            ))}
          </div>
        </section>
      </div>
      <section className="panel p-5">
        <AnswerKey answers={results.answerKey} players={snapshot.participants.length} />
      </section>
    </div>
  );
}

function PlayerAnswers({
  entry,
  score,
}: {
  entry: NonNullable<NonNullable<GameSnapshot["moderator"]>["answers"]>[number];
  score?: GameSnapshot["leaderboard"][number];
}) {
  const [open, setOpen] = useState(false);
  const valid = entry.items.filter((i) => i.isValid && !i.isDuplicate).length;
  return (
    <div className="rounded-xl border border-line bg-ink/40">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 px-3 py-2 text-left" aria-expanded={open}>
        <span className="flex-1 truncate font-semibold">{entry.displayName}</span>
        <span className="text-xs text-muted-foreground">
          bid {score?.predictedCount ?? "—"} · {valid} valid of {entry.items.length}
        </span>
        <span className={cn("rounded-md px-2 font-display font-extrabold", score?.hit ? "bg-volt/15 text-volt" : "text-faint")}>
          +{score?.roundPoints ?? 0}
        </span>
        <ChevronDown className={cn("size-4 transition", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="flex flex-wrap gap-1.5 px-3 pb-3">
          {entry.items.length === 0 && <li className="text-sm text-faint">No answers</li>}
          {entry.items.map((i) => (
            <li
              key={i.id}
              className={cn(
                "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
                i.isValid && !i.isDuplicate
                  ? "border-volt/40 text-volt"
                  : i.isDuplicate
                    ? "border-amber/40 text-amber"
                    : "border-hot/40 text-hot line-through",
              )}
            >
              {i.isValid && !i.isDuplicate ? <Check className="size-3" /> : i.isDuplicate ? <Copy className="size-3" /> : <X className="size-3" />}
              {i.text}
              {i.canonical && i.canonical.toLowerCase() !== i.text.toLowerCase() && <span className="opacity-60">({i.canonical})</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
