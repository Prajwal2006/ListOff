"use client";

import { motion } from "framer-motion";
import { Crown, Target, Trophy } from "lucide-react";
import { Avatar } from "@/components/game/avatar";
import { Confetti } from "@/components/game/confetti";
import { PhaseLabel } from "@/components/game/game-header";
import { BuiltBy } from "@/components/landing/developer-story";
import { cn } from "@/lib/utils";
import type { FinalView as FinalData } from "@/types/game";

const PODIUM = [
  { place: 2, h: "h-32", tone: "from-[#c9d0ff] to-[#7a85c9]", delay: 0.6 },
  { place: 1, h: "h-44", tone: "from-amber to-[#ff8a00]", delay: 1.0 },
  { place: 3, h: "h-24", tone: "from-[#ffb08a] to-[#c45b2b]", delay: 0.3 },
];

export function FinalView({ final, meId, gameName }: { final: FinalData; meId?: string | null; gameName: string }) {
  const standings = final.standings;
  const me = standings.find((s) => s.participantId === meId);
  const winners = standings.filter((s) => s.rank === 1);
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
      <Confetti count={110} />
      <div className="pt-2 text-center">
        <PhaseLabel tone="volt">{gameName} · final standings</PhaseLabel>
        <motion.h1
          initial={{ opacity: 0, scale: 1.8, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 160, damping: 16 }}
          className="mt-3 font-display text-[clamp(3rem,10vw,7rem)] font-black uppercase leading-[0.85]"
        >
          {winners.length > 1 ? "It's a tie!" : <span className="text-volt-glow">{winners[0]?.displayName ?? "No winner"}</span>}
          <br />
          <span className="text-text">{winners.length > 1 ? winners.map((w) => w.displayName).join(" & ") : "wins"}</span>
        </motion.h1>
        {me && (
          <p className="mt-4 text-lg text-muted-foreground">
            You finished <b className="text-text">#{me.rank}</b> with <b className="text-volt">{me.totalScore}</b> points ·
            hit {me.roundsHit} of {me.roundsPlayed} bids
          </p>
        )}
      </div>

      {/* Podium */}
      <div className="mx-auto mt-10 grid max-w-xl grid-cols-3 items-end gap-3">
        {PODIUM.map((slot) => {
          const s = standings[slot.place - 1];
          if (!s) return <div key={slot.place} />;
          return (
            <div key={slot.place} className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: slot.delay + 0.3 }}
                className="mb-2 flex flex-col items-center"
              >
                {slot.place === 1 && <Crown className="mb-1 size-8 text-amber" />}
                <Avatar name={s.displayName} avatar={s.avatar} size={slot.place === 1 ? "lg" : "md"} />
                <span className="mt-1 max-w-full truncate text-sm font-semibold">{s.displayName}</span>
                <span className="font-display text-2xl font-black tabular">{s.totalScore}</span>
              </motion.div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ delay: slot.delay, type: "spring", stiffness: 120, damping: 16 }}
                className="w-full overflow-hidden"
              >
                <div className={cn("grid w-full place-items-center rounded-t-2xl bg-gradient-to-b", slot.h, slot.tone)}>
                  <span className="font-display text-6xl font-black text-ink/70">{s.rank}</span>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Standings table */}
      <section className="panel mt-10 overflow-x-auto p-4 sm:p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-extrabold uppercase">
          <Trophy className="size-5 text-amber" /> Round by round
        </h2>
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-faint">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Player</th>
              {final.rounds.map((r) => (
                <th key={r.roundNumber} className="px-1 py-2 text-center" title={r.topicName}>
                  R{r.roundNumber}
                </th>
              ))}
              <th className="py-2 pl-2 text-center">
                <Target className="inline size-3.5" /> Hit
              </th>
              <th className="py-2 pl-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => (
              <tr key={s.participantId} className={cn("border-t border-line", s.participantId === meId && "bg-volt/[0.06]")}>
                <td className="py-2 pr-2 font-display text-lg font-black">{s.rank}</td>
                <td className="py-2 pr-2">
                  <span className="flex items-center gap-2">
                    <Avatar name={s.displayName} avatar={s.avatar} size="xs" />
                    <span className="truncate font-semibold">{s.displayName}</span>
                  </span>
                </td>
                {final.rounds.map((r) => {
                  const pr = s.perRound.find((p) => p.roundNumber === r.roundNumber);
                  return (
                    <td key={r.roundNumber} className="px-1 py-2 text-center" title={pr ? `bid ${pr.predicted ?? "—"} · got ${pr.valid}` : ""}>
                      <span
                        className={cn(
                          "inline-block min-w-8 rounded-md px-1.5 py-0.5 font-display font-extrabold tabular",
                          pr && pr.points > 0 ? "bg-volt/15 text-volt" : "text-faint",
                        )}
                      >
                        {pr ? pr.points : "–"}
                      </span>
                    </td>
                  );
                })}
                <td className="py-2 pl-2 text-center text-muted-foreground">
                  {s.roundsHit}/{s.roundsPlayed}
                </td>
                <td className="py-2 pl-2 text-right font-display text-2xl font-black tabular">{s.totalScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-faint">
          {final.rounds.map((r) => (
            <span key={r.roundNumber} className="rounded-md border border-line px-2 py-1">
              R{r.roundNumber}: {r.topicName} <span className="opacity-60">({r.categoryName})</span>
            </span>
          ))}
        </div>
      </section>

      {/* Fun stats */}
      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Sharpest shooter"
          value={best(standings, (s) => (s.roundsPlayed ? s.roundsHit / s.roundsPlayed : -1))}
          detail="best bid hit-rate"
        />
        <Stat label="Most answers" value={best(standings, (s) => s.totalValid)} detail="valid answers across the game" />
        <Stat
          label="Biggest single round"
          value={best(standings, (s) => s.bestRound?.points ?? 0)}
          detail="largest bid cashed in one go"
        />
      </section>

      <BuiltBy className="mt-10 text-center text-sm text-faint" />
    </div>
  );
}

function best<T extends { displayName: string }>(rows: T[], score: (r: T) => number) {
  if (!rows.length) return "—";
  const top = [...rows].sort((a, b) => score(b) - score(a))[0];
  return score(top) <= 0 ? "—" : top.displayName;
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="panel p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan">{label}</p>
      <p className="mt-1 truncate font-display text-3xl font-black uppercase">{value}</p>
      <p className="text-xs text-faint">{detail}</p>
    </div>
  );
}
