"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check, Copy, X } from "lucide-react";
import { AnswerKey } from "@/components/game/answer-key";
import { CategoryIcon } from "@/components/game/category-icon";
import { Confetti } from "@/components/game/confetti";
import { PhaseLabel } from "@/components/game/game-header";
import { Tally } from "@/components/game/tally";
import { Leaderboard } from "@/components/leaderboard/leaderboard";
import type { GameSnapshot } from "@/types/game";

export function ResultsView({ snapshot }: { snapshot: GameSnapshot }) {
  const results = snapshot.results!;
  const meId = snapshot.me?.id;
  const mine = results.scores.find((s) => s.participantId === meId);
  const answers = results.mine ?? [];
  const accepted = answers.filter((a) => a.isValid && !a.isDuplicate);
  const dupes = answers.filter((a) => a.isDuplicate);
  const rejected = answers.filter((a) => !a.isValid && !a.isDuplicate);
  const mineSet = useMemo(() => new Set(accepted.map((a) => a.canonical ?? "")), [accepted]);
  const hit = !!mine?.hit;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-14 sm:px-6">
      {hit && <Confetti />}
      <div className="flex flex-col items-center pt-2 text-center">
        <PhaseLabel tone={hit ? "volt" : "hot"}>
          Round {results.roundNumber} results · <CategoryIcon name={results.topic.categoryIcon} className="inline size-3.5" />{" "}
          {results.topic.name}
        </PhaseLabel>
        {mine && (
          <>
            <motion.div
              initial={{ scale: 3, rotate: -18, opacity: 0 }}
              animate={{ scale: 1, rotate: -4, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}
              className={
                hit
                  ? "mt-5 rounded-3xl bg-volt px-8 py-4 font-display text-6xl font-black uppercase text-[#0a0d00] shadow-[0_8px_0_var(--volt-deep),0_0_80px_rgb(200_255_46/0.45)] sm:text-8xl"
                  : mine.predictedCount === null
                    ? "mt-5 rounded-3xl border-2 border-line-strong px-8 py-4 font-display text-5xl font-black uppercase text-muted-foreground sm:text-7xl"
                    : "mt-5 rounded-3xl border-4 border-hot px-8 py-4 font-display text-6xl font-black uppercase text-hot shadow-[0_0_60px_rgb(255_77_126/0.35)] sm:text-8xl"
              }
            >
              {hit ? `+${mine.roundPoints}` : mine.predictedCount === null ? "No bid" : "Bust"}
            </motion.div>
            <p className="mt-5 font-display text-2xl font-extrabold uppercase">
              Bid <span className="text-uv-soft">{mine.predictedCount ?? "—"}</span> · Got{" "}
              <span className={hit ? "text-volt" : "text-text"}>{mine.validCount}</span>
            </p>
            <Tally count={mine.validCount} target={mine.predictedCount} className="mt-3 justify-center" />
          </>
        )}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {snapshot.me && (
          <section className="panel p-5">
            <h3 className="mb-3 font-display text-2xl font-extrabold uppercase">Your answers</h3>
            {answers.length === 0 && <p className="text-muted-foreground">You didn&apos;t enter anything this round.</p>}
            <ul className="flex flex-wrap gap-1.5">
              {accepted.map((a) => (
                <li key={a.id} className="flex items-center gap-1 rounded-full border border-volt/50 bg-volt/10 px-2.5 py-1 text-sm font-semibold text-volt">
                  <Check className="size-3.5" /> {a.canonical ?? a.text}
                </li>
              ))}
              {dupes.map((a) => (
                <li key={a.id} className="flex items-center gap-1 rounded-full border border-amber/40 bg-amber/10 px-2.5 py-1 text-sm text-amber">
                  <Copy className="size-3.5" /> {a.text}
                </li>
              ))}
              {rejected.map((a) => (
                <li key={a.id} className="flex items-center gap-1 rounded-full border border-hot/40 bg-hot/10 px-2.5 py-1 text-sm text-hot line-through">
                  <X className="size-3.5" /> {a.text}
                </li>
              ))}
            </ul>
            {(dupes.length > 0 || rejected.length > 0) && (
              <p className="mt-3 text-xs text-faint">
                {accepted.length} accepted · {dupes.length} duplicate · {rejected.length} not on the list
              </p>
            )}
          </section>
        )}
        <section className={snapshot.me ? "" : "lg:col-span-2"}>
          <h3 className="mb-3 font-display text-2xl font-extrabold uppercase">Leaderboard</h3>
          <Leaderboard rows={results.scores} meId={meId} animationKey={results.roundNumber} />
        </section>
      </div>

      <section className="panel mt-6 p-5">
        <AnswerKey answers={results.answerKey} players={snapshot.participants.length} mine={mineSet} />
      </section>

      <p className="mt-8 text-center font-display text-xl font-extrabold uppercase text-muted-foreground">
        {results.isFinalRound ? "That was the final round — final standings coming up" : "Waiting for the host to start the next round"}
      </p>
    </div>
  );
}
