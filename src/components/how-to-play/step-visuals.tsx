"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Copy, CornerDownLeft, Crown, Lock, Minus, Plus, QrCode, X } from "lucide-react";
import { Avatar } from "@/components/game/avatar";
import { Tally } from "@/components/game/tally";
import { cn } from "@/lib/utils";

/** Loops a counter 0..steps-1 while the element is on screen. */
function useLoop(steps: number, ms: number) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setI((n) => (n + 1) % steps), ms);
    return () => clearInterval(t);
  }, [inView, steps, ms]);
  return { ref, i };
}

function Screen({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto flex aspect-[4/3] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-line-strong bg-ink/80 p-5 shadow-[0_30px_80px_rgb(0_0_0/0.45)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

const PLAYERS = [
  { name: "Ana", avatar: 1 },
  { name: "Ben", avatar: 3 },
  { name: "Cy", avatar: 5 },
  { name: "Dee", avatar: 7 },
  { name: "You", avatar: 0 },
];

/* 1 — Host creates a room and shares the code */
export function HostVisual() {
  const { ref, i } = useLoop(PLAYERS.length + 2, 700);
  const joined = Math.min(i, PLAYERS.length);
  return (
    <div ref={ref}>
      <Screen>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan">Host screen · lobby</p>
        <div className="mt-3 flex items-center gap-4">
          <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-white text-ink">
            <QrCode className="size-14" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Room code</p>
            <p className="font-mono text-4xl font-bold tracking-[0.25em]">K7XQ2M</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-faint">
              <Copy className="size-3" /> listoff.app/join/K7XQ2M
            </p>
          </div>
        </div>
        <div className="mt-auto">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="font-display text-lg font-extrabold uppercase">Players</span>
            <span className="font-display text-2xl font-black tabular text-volt">{joined}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {PLAYERS.slice(0, joined).map((p) => (
                <motion.span
                  key={p.name}
                  initial={{ opacity: 0, scale: 0.4, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-night px-2 py-1 text-xs font-semibold"
                >
                  <Avatar name={p.name} avatar={p.avatar} size="xs" />
                  {p.name}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </Screen>
    </div>
  );
}

/* 2 — Players join from their phones */
export function JoinVisual() {
  const name = "Fruit Ninja";
  const { ref, i } = useLoop(name.length + 6, 160);
  const typed = name.slice(0, Math.min(i, name.length));
  const done = i > name.length + 1;
  return (
    <div ref={ref} className="flex justify-center">
      <div className="relative h-[330px] w-[190px] rounded-[2.2rem] border-4 border-deck-2 bg-ink p-3 shadow-[0_30px_80px_rgb(0_0_0/0.45)]">
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-deck-2" />
        <p className="text-center font-mono text-[10px] tracking-[0.35em] text-cyan">K7XQ2M</p>
        <p className="mt-1 text-center font-display text-lg font-black uppercase leading-none">Friday Night</p>
        <p className="mt-5 text-[10px] font-semibold text-muted-foreground">Your display name</p>
        <div className="mt-1 flex h-10 items-center justify-center rounded-xl border border-volt/60 bg-night font-display text-base font-extrabold uppercase">
          {typed}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            className="ml-0.5 inline-block h-4 w-0.5 bg-volt"
          />
        </div>
        <motion.div
          animate={done ? { scale: [1, 0.94, 1] } : {}}
          className="mt-3 grid h-10 place-items-center rounded-xl bg-volt font-display text-sm font-extrabold uppercase text-[#0a0d00] shadow-[0_4px_0_var(--volt-deep)]"
        >
          Join game
        </motion.div>
        <AnimatePresence>
          {done && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-center justify-center gap-1 text-center text-xs font-semibold text-volt"
            >
              <Check className="size-3.5" /> You&apos;re in!
            </motion.p>
          )}
        </AnimatePresence>
        <p className="absolute inset-x-0 bottom-4 text-center text-[9px] text-faint">No app · no account</p>
      </div>
    </div>
  );
}

/* 3 — See the topic, then bid */
export function BidVisual() {
  const { ref, i } = useLoop(9, 650);
  const bid = [3, 4, 5, 6, 7, 7, 7, 7, 7][i];
  const locked = i >= 6;
  return (
    <div ref={ref}>
      <Screen className="items-center text-center">
        <p className="font-display text-2xl font-black uppercase leading-none">
          How many <span className="text-uv-soft">can you name?</span>
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-line-strong bg-night px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Topic · <span className="text-volt">Fruits</span>
        </div>
        <div className="mt-auto flex items-center gap-4">
          <span className={cn("grid size-10 place-items-center rounded-xl border border-line-strong bg-deck", locked && "opacity-30")}>
            <Minus className="size-5" />
          </span>
          <motion.span
            key={bid}
            initial={{ scale: 1.4, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "grid size-24 place-items-center rounded-3xl font-display text-6xl font-black",
              locked ? "bg-uv text-white shadow-[0_6px_0_#4a1fd1,0_0_50px_rgb(139_92_255/0.5)]" : "text-text",
            )}
          >
            {bid}
          </motion.span>
          <span className={cn("grid size-10 place-items-center rounded-xl border border-line-strong bg-deck", locked && "opacity-30")}>
            <Plus className="size-5" />
          </span>
        </div>
        <p className={cn("mt-4 flex items-center gap-1.5 font-display text-base font-extrabold uppercase", locked ? "text-uv-soft" : "text-faint")}>
          <Lock className="size-4" /> {locked ? "Locked · no take-backs" : "Choose wisely…"}
        </p>
      </Screen>
    </div>
  );
}

/* 4 — Bids lock, clock starts */
export function RevealVisual() {
  const { ref, i } = useLoop(6, 800);
  const show = i >= 1;
  const count = [null, null, 3, 2, 1, "GO!"][i];
  return (
    <div ref={ref}>
      <Screen className="items-center justify-center text-center">
        <motion.div
          aria-hidden
          className="absolute inset-0"
          animate={{ opacity: show ? 1 : 0 }}
          style={{ background: "radial-gradient(circle at 50% 45%, rgb(200 255 46 / 0.22), transparent 65%)" }}
        />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.3em] text-cyan">Name as many</p>
        <AnimatePresence mode="wait">
          {show ? (
            <motion.p
              key="topic"
              initial={{ scale: 2.4, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ type: "spring", stiffness: 160, damping: 14 }}
              className="relative font-display text-6xl font-black uppercase text-volt-glow"
            >
              Fruits
            </motion.p>
          ) : (
            <motion.p key="q" exit={{ opacity: 0 }} className="relative font-mono text-4xl font-bold tracking-[0.3em] text-faint">
              Bids in…
            </motion.p>
          )}
        </AnimatePresence>
        <p className="relative text-[10px] font-bold uppercase tracking-[0.3em] text-cyan">as you can</p>
        <div className="relative mt-4 h-14">
          <AnimatePresence mode="popLayout">
            {count !== null && (
              <motion.span
                key={String(count)}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className={cn("block font-display text-5xl font-black", count === "GO!" ? "text-volt" : "text-text")}
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </Screen>
    </div>
  );
}

/* 5 — Race the clock */
const RACE: { text: string; ok: "valid" | "dupe" | "bad" }[] = [
  { text: "Mango", ok: "valid" },
  { text: "Kiwi", ok: "valid" },
  { text: "Laptop", ok: "bad" },
  { text: "Lychee", ok: "valid" },
  { text: "kiwi", ok: "dupe" },
  { text: "Papaya", ok: "valid" },
  { text: "Fig", ok: "valid" },
  { text: "Guava", ok: "valid" },
];
export function RaceVisual() {
  const { ref, i } = useLoop(RACE.length + 4, 600);
  const shown = RACE.slice(0, Math.min(i, RACE.length));
  const valid = shown.filter((r) => r.ok === "valid").length;
  const bid = 5;
  const secs = Math.max(1, 20 - i * 1.5);
  return (
    <div ref={ref}>
      <Screen>
        <div className="flex items-center justify-between">
          <span className="font-display text-3xl font-black uppercase">Fruits</span>
          <span className={cn("font-display text-3xl font-black tabular", secs <= 5 ? "text-hot" : "text-cyan")}>
            0:{String(Math.ceil(secs)).padStart(2, "0")}
          </span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
          <motion.div className="h-full bg-cyan" animate={{ width: `${(secs / 20) * 100}%` }} />
        </div>
        <div className="mt-3 flex items-end justify-between">
          <p className="font-display text-5xl font-black tabular leading-none">
            <span className={valid >= bid ? "text-volt" : ""}>{valid}</span>
            <span className="text-2xl text-faint"> / {bid}</span>
          </p>
          <AnimatePresence>
            {valid >= bid && (
              <motion.span
                initial={{ scale: 0.4, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: -4, opacity: 1 }}
                className="rounded-lg bg-volt px-2 py-1 font-display text-sm font-black uppercase text-[#0a0d00]"
              >
                Bid met!
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <Tally count={valid} target={bid} className="mt-2 min-h-9" />
        <div className="mt-2 flex h-9 items-center gap-2 rounded-xl border border-volt/50 bg-night px-3 text-sm text-faint">
          Type an answer, hit Enter <CornerDownLeft className="ml-auto size-4 text-volt" />
        </div>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          <AnimatePresence>
            {shown.map((r) => (
              <motion.li
                key={r.text}
                initial={{ opacity: 0, y: -8, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
                  r.ok === "valid" && "border-volt/50 bg-volt/10 text-volt",
                  r.ok === "dupe" && "border-amber/50 bg-amber/10 text-amber",
                  r.ok === "bad" && "border-hot/50 bg-hot/10 text-hot line-through",
                )}
              >
                {r.ok === "valid" ? <Check className="size-3" /> : r.ok === "dupe" ? <Copy className="size-3" /> : <X className="size-3" />}
                {r.text}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </Screen>
    </div>
  );
}

/* 6 — Leaderboard */
const BOARD = [
  { name: "Ana", avatar: 1, before: 12, pts: 0 },
  { name: "You", avatar: 0, before: 9, pts: 5 },
  { name: "Ben", avatar: 3, before: 10, pts: 3 },
  { name: "Cy", avatar: 5, before: 4, pts: 0 },
];
export function BoardVisual() {
  const { ref, i } = useLoop(4, 1600);
  const after = i >= 1;
  const rows = [...BOARD].sort((a, b) =>
    after ? b.before + b.pts - (a.before + a.pts) : b.before - a.before,
  );
  return (
    <div ref={ref}>
      <Screen>
        <p className="mb-3 font-display text-xl font-extrabold uppercase">Round 3 standings</p>
        <ol className="space-y-2">
          {rows.map((r, idx) => (
            <motion.li
              key={r.name}
              layout
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border bg-night/80 px-3 py-2",
                r.name === "You" ? "border-volt/60" : "border-line",
              )}
            >
              <span className="w-5 text-center font-display text-lg font-black text-faint">
                {idx === 0 && after ? <Crown className="size-4 text-amber" /> : idx + 1}
              </span>
              <Avatar name={r.name} avatar={r.avatar} size="xs" />
              <span className="flex-1 text-sm font-semibold">{r.name}</span>
              {after && (
                <span className={cn("rounded-md px-1.5 text-xs font-bold", r.pts ? "bg-volt/15 text-volt" : "text-faint")}>
                  +{r.pts}
                </span>
              )}
              <span className="w-8 text-right font-display text-xl font-black tabular">{after ? r.before + r.pts : r.before}</span>
            </motion.li>
          ))}
        </ol>
      </Screen>
    </div>
  );
}
