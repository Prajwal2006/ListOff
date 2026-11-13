"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Tally } from "@/components/game/tally";

const SCRIPT = [
  { topic: "Fruits", bid: 5, answers: ["Mango", "Kiwi", "Car", "Lychee", "Papaya", "Fig", "Guava"] },
  { topic: "Planets", bid: 6, answers: ["Mars", "Venus", "Pluto?", "Earth", "Saturn", "Neptune"] },
  { topic: "Dog breeds", bid: 4, answers: ["Beagle", "Pug", "Husky", "Corgi", "Akita"] },
];
const INVALID = new Set(["Car", "Pluto?"]);

type Phase = "bid" | "reveal" | "race" | "result";

/** A looping, self-playing round: the product explains itself in eight seconds. */
export function HeroDemo() {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("bid");
  const [typed, setTyped] = useState(0);
  const s = SCRIPT[round % SCRIPT.length];

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === "bid") t = setTimeout(() => setPhase("reveal"), 1600);
    else if (phase === "reveal") t = setTimeout(() => setPhase("race"), 1400);
    else if (phase === "race") {
      if (typed < s.answers.length) t = setTimeout(() => setTyped((n) => n + 1), 520);
      else t = setTimeout(() => setPhase("result"), 500);
    } else
      t = setTimeout(() => {
        setRound((r) => r + 1);
        setTyped(0);
        setPhase("bid");
      }, 2600);
    return () => clearTimeout(t);
  }, [phase, typed, s.answers.length]);

  const shown = s.answers.slice(0, typed);
  const valid = shown.filter((a) => !INVALID.has(a)).length;
  const met = valid >= s.bid;

  return (
    <div className="panel relative mx-auto w-full max-w-md overflow-hidden p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <span>Live round</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-hot animate-pulse" /> demo
        </span>
      </div>

      <div className="relative min-h-[300px]">
        <AnimatePresence mode="wait">
          {phase === "bid" && (
            <motion.div
              key={`bid-${round}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="flex flex-col items-center justify-center gap-3 pt-6 text-center"
            >
              <p className="font-display text-2xl font-extrabold uppercase text-muted-foreground">How many can you name?</p>
              <p className="text-sm text-faint">Topic: <span className="rounded bg-deck px-2 py-0.5 font-mono text-muted-foreground">??????</span></p>
              <motion.div
                initial={{ scale: 0.6, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 14 }}
                className="mt-2 grid size-28 place-items-center rounded-3xl bg-uv font-display text-7xl font-black text-white shadow-[0_8px_0_#4a1fd1,0_0_60px_rgb(139_92_255/0.5)]"
              >
                {s.bid}
              </motion.div>
              <p className="text-sm font-semibold text-uv-soft">Bid locked</p>
            </motion.div>
          )}

          {phase === "reveal" && (
            <motion.div
              key={`reveal-${round}`}
              initial={{ opacity: 0, scale: 1.4, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
              className="flex flex-col items-center justify-center pt-12 text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Name as many</p>
              <p className="font-display text-7xl font-black uppercase text-volt-glow">{s.topic}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">as you can</p>
            </motion.div>
          )}

          {(phase === "race" || phase === "result") && (
            <motion.div key={`race-${round}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-3 flex items-baseline justify-between">
                <span className="font-display text-3xl font-black uppercase">{s.topic}</span>
                <span className="font-display text-3xl font-black tabular">
                  <span className={met ? "text-volt" : "text-text"}>{valid}</span>
                  <span className="text-faint">/{s.bid}</span>
                </span>
              </div>
              <Tally count={valid} target={s.bid} className="mb-4 min-h-9" />
              <ul className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {shown.map((a) => {
                    const bad = INVALID.has(a);
                    return (
                      <motion.li
                        key={a}
                        layout
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={bad ? { opacity: 1, y: 0, scale: 1, x: [0, -6, 6, -3, 0] } : { opacity: 1, y: 0, scale: 1 }}
                        className={
                          bad
                            ? "flex items-center gap-1 rounded-full border border-hot/50 bg-hot/10 px-3 py-1.5 text-sm text-hot line-through"
                            : "flex items-center gap-1 rounded-full border border-volt/40 bg-volt/10 px-3 py-1.5 text-sm font-semibold text-volt"
                        }
                      >
                        {bad ? <X className="size-3.5" /> : <Check className="size-3.5" />}
                        {a}
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
              <AnimatePresence>
                {phase === "result" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: -6 }}
                    animate={{ opacity: 1, scale: 1, rotate: -3 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="absolute inset-x-0 bottom-0 mx-auto w-fit rounded-2xl bg-volt px-6 py-3 text-center font-display text-3xl font-black uppercase text-[#0a0d00] shadow-[0_6px_0_var(--volt-deep),0_0_60px_rgb(200_255_46/0.5)]"
                  >
                    Bid met · +{s.bid}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
