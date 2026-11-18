"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, CornerDownLeft, RotateCcw, X } from "lucide-react";
import { Stepper } from "@/components/game/stepper";
import { Tally } from "@/components/game/tally";
import { calculatePoints } from "@/lib/scoring";
import { normalizeAnswer } from "@/lib/validation/normalize";
import { TopicIndex } from "@/lib/validation/topic-index";
import { parseAnswers } from "@/lib/seed/parse";
import { cn } from "@/lib/utils";

/** Try the scoring rule: pick a bid and a result, see the points. */
export function ScoringPlayground() {
  const [bid, setBid] = useState(5);
  const [got, setGot] = useState(6);
  const points = calculatePoints(got, bid);
  const hit = points > 0;
  return (
    <div className="panel grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
      <div className="text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-uv-soft">Your bid</p>
        <Stepper value={bid} onChange={setBid} min={1} max={20} label="bid" />
      </div>
      <div className="hidden h-24 w-px bg-line lg:block" />
      <div className="text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cyan">Valid answers you named</p>
        <Stepper value={got} onChange={setGot} min={0} max={20} label="valid answers" />
      </div>

      <div className="flex flex-col items-center gap-3 lg:col-span-3">
        <Tally count={got} target={bid} className="justify-center" max={20} />
        <AnimatePresence mode="wait">
          <motion.div
            key={`${hit}-${points}`}
            initial={{ scale: 1.8, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: -3, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 16 }}
            className={cn(
              "rounded-3xl px-8 py-3 font-display text-5xl font-black uppercase sm:text-6xl",
              hit
                ? "bg-volt text-[#0a0d00] shadow-[0_8px_0_var(--volt-deep),0_0_60px_rgb(200_255_46/0.4)]"
                : "border-4 border-hot text-hot shadow-[0_0_40px_rgb(255_77_126/0.3)]",
            )}
          >
            {hit ? `+${points}` : "Bust · 0"}
          </motion.div>
        </AnimatePresence>
        <p className="max-w-md text-center text-sm text-muted-foreground">
          {hit
            ? got > bid
              ? `You named ${got - bid} more than you needed — extras don't earn anything. You score exactly your bid.`
              : "Exactly on the money. You score your bid."
            : got === 0
              ? "Nothing named, nothing scored."
              : `${bid - got} short of your bid. Close doesn't count — that's zero.`}
        </p>
      </div>
    </div>
  );
}

const SAMPLE = "Apple|Banana|Mango|Orange|Grape=Grapes|Watermelon|Strawberry|Kiwi=Kiwifruit|Lychee=Litchi|Pineapple|Papaya|Fig|Guava|Cherry|Peach|Pear|Plum|Blueberry|Raspberry|Pomegranate|Coconut|Avocado|Lemon|Lime|Star fruit=Carambola|Dragon fruit=Pitaya|Passion fruit|Apricot|Cantaloupe|Tangerine";

type Result = { key: number; text: string; status: "valid" | "dupe" | "invalid"; canonical: string | null };

/** A live answer checker running the game's real matching engine on a sample "Fruits" list. */
export function AnswerChecker() {
  const index = useMemo(
    () =>
      new TopicIndex(
        parseAnswers(SAMPLE).map((a, i) => ({
          id: i + 1,
          canonical: a.canonical,
          normalized: normalizeAnswer(a.canonical),
          aliases: a.aliases.map(normalizeAnswer),
        })),
      ),
    [],
  );
  const [text, setText] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const credited = useMemo(() => new Set(results.filter((r) => r.status === "valid").map((r) => r.canonical)), [results]);

  function submit() {
    const t = text.trim();
    if (!t) return;
    const m = index.match(t);
    const status: Result["status"] = m.answerId === null ? "invalid" : credited.has(m.canonical) ? "dupe" : "valid";
    setResults((r) => [{ key: Date.now(), text: t, status, canonical: m.canonical }, ...r].slice(0, 14));
    setText("");
  }

  const tries = ["APPLE", "  grapes ", "litchi", "water melon", "Car", "apple"];
  return (
    <div className="panel p-5 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan">Try it · topic: Fruits</p>
        <p className="text-xs text-faint">Same matching engine the game uses</p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mt-3 flex gap-2"
      >
        <label htmlFor="try-answer" className="sr-only">
          Type a fruit
        </label>
        <input
          id="try-answer"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a fruit and press Enter"
          autoComplete="off"
          className="h-14 min-w-0 flex-1 rounded-2xl border-2 border-line-strong bg-ink/70 px-4 text-xl font-semibold placeholder:text-faint focus:border-volt focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Check answer"
          className="grid size-14 shrink-0 place-items-center rounded-2xl bg-volt text-[#0a0d00] shadow-[0_5px_0_var(--volt-deep)] active:translate-y-1 active:shadow-[0_1px_0_var(--volt-deep)]"
        >
          <CornerDownLeft className="size-6" />
        </button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-faint">
        Try:
        {tries.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setText(t)}
            className="rounded-md border border-line bg-night px-2 py-0.5 font-mono text-muted-foreground hover:text-text"
          >
            {JSON.stringify(t)}
          </button>
        ))}
        {results.length > 0 && (
          <button type="button" onClick={() => setResults([])} className="ml-auto flex items-center gap-1 hover:text-text">
            <RotateCcw className="size-3" /> Reset
          </button>
        )}
      </div>
      <ul className="mt-4 min-h-16 space-y-1.5" aria-live="polite">
        <AnimatePresence initial={false}>
          {results.map((r) => (
            <motion.li
              key={r.key}
              layout
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                r.status === "valid" && "border-volt/40 bg-volt/10",
                r.status === "dupe" && "border-amber/40 bg-amber/10",
                r.status === "invalid" && "border-hot/40 bg-hot/10",
              )}
            >
              {r.status === "valid" ? (
                <Check className="size-4 text-volt" />
              ) : r.status === "dupe" ? (
                <Copy className="size-4 text-amber" />
              ) : (
                <X className="size-4 text-hot" />
              )}
              <span className="min-w-0 truncate font-mono">{JSON.stringify(r.text)}</span>
              <span className="ml-auto shrink-0 text-right text-xs text-muted-foreground">
                {r.status === "valid" && <>counts as <b className="text-volt">{r.canonical}</b></>}
                {r.status === "dupe" && <>already counted as <b className="text-amber">{r.canonical}</b></>}
                {r.status === "invalid" && <>not on the Fruits list</>}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
        {results.length === 0 && <li className="py-4 text-center text-sm text-faint">Your checked answers show up here.</li>}
      </ul>
    </div>
  );
}
