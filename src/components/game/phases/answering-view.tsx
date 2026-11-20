"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { Check, CircleSlash, CornerDownLeft, Copy, Loader2, Sparkles, Timer, X } from "lucide-react";
import { CountdownRing, TimerBar } from "@/components/game/countdown-ring";
import { Confetti } from "@/components/game/confetti";
import { Tally } from "@/components/game/tally";
import { api, ApiError } from "@/lib/client/api";
import { useCountdown } from "@/lib/realtime/use-countdown";
import { calculatePoints } from "@/lib/scoring";
import { MAX_ANSWER_LENGTH, normalizeAnswer } from "@/lib/validation/normalize";
import { cn } from "@/lib/utils";
import type { PublicTopic, SubmittedAnswerView } from "@/types/game";

type Status = "pending" | "valid" | "duplicate" | "invalid" | "late" | "error";
interface Entry {
  key: string;
  text: string;
  normalized: string;
  status: Status;
  canonical: string | null;
  /** Recognized via spelling autocorrect. */
  corrected?: boolean;
}

function fromServer(a: SubmittedAnswerView): Entry {
  return {
    key: `s${a.id}`,
    text: a.text,
    normalized: normalizeAnswer(a.text),
    canonical: a.canonical,
    status: a.isValid ? (a.isDuplicate ? "duplicate" : "valid") : a.isDuplicate ? "duplicate" : "invalid",
  };
}

export function AnsweringView({
  code,
  token,
  topic,
  bid,
  deadline,
  totalMs,
  offset,
  initial,
}: {
  code: string;
  token: string;
  topic: PublicTopic;
  bid: number | null;
  deadline: number;
  totalMs: number;
  offset: number;
  initial: SubmittedAnswerView[];
}) {
  const [entries, setEntries] = useState<Entry[]>(() => initial.map(fromServer).reverse());
  const [text, setText] = useState("");
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shake = useAnimationControls();
  const seq = useRef(0);
  const { msLeft, done } = useCountdown(deadline, offset, 100);

  const valid = useMemo(() => entries.filter((e) => e.status === "valid").length, [entries]);
  const pending = entries.some((e) => e.status === "pending");
  const met = bid !== null && valid >= bid;

  // Celebrate the moment the bid is reached.
  const wasMet = useRef(met);
  useEffect(() => {
    if (met && !wasMet.current) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 2600);
      wasMet.current = true;
      return () => clearTimeout(t);
    }
    wasMet.current = met;
  }, [met]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const update = (key: string, patch: Partial<Entry>) =>
    setEntries((list) => list.map((e) => (e.key === key ? { ...e, ...patch } : e)));

  async function send(entry: Entry, attempt = 0): Promise<void> {
    try {
      const r = await api.answer(code, token, entry.text);
      update(entry.key, {
        canonical: r.canonicalAnswer,
        corrected: r.corrected,
        status: r.isValid ? (r.isDuplicate ? "duplicate" : "valid") : r.isDuplicate ? "duplicate" : "invalid",
      });
    } catch (e) {
      if (e instanceof ApiError && e.code === "DEADLINE_PASSED") return update(entry.key, { status: "late" });
      if (e instanceof ApiError && (e.code === "NETWORK" || e.status >= 500 || e.status === 429) && attempt < 2) {
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
        return send(entry, attempt + 1);
      }
      update(entry.key, { status: e instanceof ApiError && e.code === "WRONG_PHASE" ? "late" : "error" });
    }
  }

  function submit() {
    const raw = text.replace(/\s+/g, " ").trim();
    if (!raw || done) return;
    const normalized = normalizeAnswer(raw);
    if (!normalized) {
      shake.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.35 } });
      return;
    }
    const existing = entries.find((e) => e.normalized === normalized);
    setText("");
    if (existing) {
      setFlashKey(existing.key);
      setTimeout(() => setFlashKey(null), 900);
      shake.start({ x: [0, -8, 8, -4, 4, 0], transition: { duration: 0.3 } });
      return;
    }
    const entry: Entry = { key: `l${++seq.current}`, text: raw, normalized, status: "pending", canonical: null };
    setEntries((list) => [entry, ...list]);
    void send(entry);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pb-10 sm:px-6">
      {celebrate && <Confetti count={50} />}

      {/* Topic + clock */}
      <div className="flex items-center gap-4 pt-1">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan">Name as many</p>
          <h1 className="truncate font-display text-4xl font-black uppercase leading-none sm:text-6xl">{topic.name}</h1>
        </div>
        <CountdownRing msLeft={msLeft} totalMs={totalMs} size={96} label="sec" />
      </div>
      <div className="mt-3">
        <TimerBar msLeft={msLeft} totalMs={totalMs} />
      </div>

      {/* Score vs bid */}
      <div className="panel relative mt-5 overflow-hidden p-4 sm:p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Accepted</p>
            <p className="font-display text-7xl font-black leading-none tabular sm:text-8xl">
              <motion.span
                key={valid}
                initial={{ scale: 1.4, color: "#c8ff2e" }}
                animate={{ scale: 1, color: met ? "#c8ff2e" : "#eef0ff" }}
                className="inline-block"
              >
                {valid}
              </motion.span>
              {bid !== null && <span className="text-4xl text-faint sm:text-5xl"> / {bid}</span>}
            </p>
          </div>
          <div className="text-right">
            {bid === null ? (
              <p className="max-w-[12rem] text-sm text-muted-foreground">No bid this round — you can still play for fun.</p>
            ) : met ? (
              <motion.p
                initial={{ scale: 0.5, rotate: -8, opacity: 0 }}
                animate={{ scale: 1, rotate: -3, opacity: 1 }}
                className="rounded-xl bg-volt px-3 py-1.5 font-display text-2xl font-black uppercase text-[#0a0d00]"
              >
                Bid met · +{calculatePoints(valid, bid)}
              </motion.p>
            ) : (
              <p className="font-display text-2xl font-extrabold uppercase text-muted-foreground">
                <span className="text-text">{bid - valid}</span> to go
              </p>
            )}
          </div>
        </div>
        <Tally count={valid} target={bid} className="mt-4 min-h-9" />
      </div>

      {/* Input */}
      <motion.form
        animate={shake}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
          inputRef.current?.focus();
        }}
        className="mt-5 flex items-stretch gap-2"
      >
        <label htmlFor="answer" className="sr-only">
          Your answer
        </label>
        <input
          id="answer"
          ref={inputRef}
          value={text}
          disabled={done}
          maxLength={MAX_ANSWER_LENGTH}
          onChange={(e) => setText(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="words"
          spellCheck={false}
          enterKeyHint="send"
          placeholder={done ? "Time's up" : "Type an answer, hit Enter"}
          className="h-16 min-w-0 flex-1 rounded-2xl border-2 border-line-strong bg-night/90 px-5 text-2xl font-semibold text-text placeholder:text-faint focus:border-volt focus:shadow-[0_0_0_4px_rgb(200_255_46/0.15)] focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={done || !text.trim()}
          aria-label="Add answer"
          className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-volt text-[#0a0d00] shadow-[0_5px_0_var(--volt-deep)] transition active:translate-y-1 active:shadow-[0_1px_0_var(--volt-deep)] disabled:opacity-40"
        >
          <CornerDownLeft className="size-7" strokeWidth={2.6} />
        </button>
      </motion.form>
      <div className="mt-2 flex justify-between text-xs text-faint">
        <span>
          {entries.length} entered · {valid} accepted {pending && <Loader2 className="ml-1 inline size-3 animate-spin" />}
        </span>
        <span className="hidden sm:inline">Enter to add · typos are autocorrected · duplicates caught instantly</span>
      </div>

      {/* Entries */}
      <ul className="mt-4 flex flex-wrap gap-2" aria-live="polite">
        <AnimatePresence initial={false}>
          {entries.map((e) => (
            <EntryChip key={e.key} entry={e} flash={flashKey === e.key} />
          ))}
        </AnimatePresence>
      </ul>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 1.6 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-none fixed inset-0 z-30 grid place-items-center bg-ink/70 backdrop-blur-sm"
          >
            <div className="text-center">
              <Timer className="mx-auto size-14 text-hot" />
              <p className="font-display text-8xl font-black uppercase text-hot">Time!</p>
              <p className="mt-2 text-muted-foreground">Answers locked. Tallying the room…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EntryChip({ entry, flash }: { entry: Entry; flash: boolean }) {
  const s = entry.status;
  const tone = {
    pending: "border-line-strong bg-deck/70 text-muted-foreground",
    valid: "border-volt/50 bg-volt/10 text-volt",
    duplicate: "border-amber/50 bg-amber/10 text-amber",
    invalid: "border-hot/40 bg-hot/10 text-hot",
    late: "border-line bg-night text-faint",
    error: "border-hot/40 bg-night text-hot",
  }[s];
  const Icon = { pending: Loader2, valid: Check, duplicate: Copy, invalid: X, late: Timer, error: CircleSlash }[s];
  const showCanonical = entry.canonical && normalizeAnswer(entry.canonical) !== entry.normalized;
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -14, scale: 0.7 }}
      animate={
        s === "invalid"
          ? { opacity: 1, y: 0, scale: 1, x: [0, -6, 6, -3, 3, 0] }
          : flash
            ? { opacity: 1, y: 0, scale: [1, 1.18, 1] }
            : { opacity: 1, y: 0, scale: 1 }
      }
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{
        default: { type: "spring", stiffness: 500, damping: 30 },
        // Keyframed shake / pulse must be tweens (springs only interpolate two values).
        x: { type: "tween", duration: 0.35 },
        scale: flash ? { type: "tween", duration: 0.4 } : { type: "spring", stiffness: 500, damping: 30 },
      }}
      className={cn(
        "flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold",
        tone,
        flash && "ring-2 ring-amber",
      )}
      title={
        s === "duplicate"
          ? `Already counted${entry.canonical ? ` as ${entry.canonical}` : ""}`
          : s === "invalid"
            ? "Not on the list for this topic"
            : s === "late"
              ? "Arrived after the buzzer"
              : undefined
      }
    >
      <Icon className={cn("size-3.5 shrink-0", s === "pending" && "animate-spin")} strokeWidth={2.6} />
      <span className={cn("truncate", (s === "invalid" || s === "late") && "line-through decoration-2")}>{entry.text}</span>
      {s === "valid" && showCanonical && (
        <span className="flex items-center gap-0.5 truncate text-xs font-normal opacity-80">
          {entry.corrected && <Sparkles className="size-3 shrink-0" aria-label="autocorrected" />}→ {entry.canonical}
        </span>
      )}
      {s === "duplicate" && <span className="text-xs font-normal opacity-80">dupe</span>}
    </motion.li>
  );
}
