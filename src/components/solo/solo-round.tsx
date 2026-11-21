"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, CornerDownLeft, Lock, SkipForward, Sparkles, Trophy, X } from "lucide-react";
import { toast } from "sonner";
import { AppealButton } from "@/components/game/appeal-button";
import { ArcadeButton } from "@/components/game/arcade-button";
import { Confetti } from "@/components/game/confetti";
import { CountdownRing } from "@/components/game/countdown-ring";
import { Stepper } from "@/components/game/stepper";
import { Tally } from "@/components/game/tally";
import { TopicCard } from "@/components/game/phases/prediction-view";
import { ApiError } from "@/lib/client/api";
import { soloApi } from "@/lib/client/solo-api";
import { useServerNow } from "@/lib/realtime/use-countdown";
import { calculatePoints, MAX_PREDICTION, MIN_PREDICTION } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import type { SoloRoundView } from "@/types/solo";

type Entry = { key: number; text: string; canonical: string | null; status: "valid" | "dupe" | "invalid"; corrected: boolean };

/** Plays one solo round end to end. All timing and scoring is decided by the server. */
export function SoloRound({
  initial,
  onNext,
  onScored,
}: {
  initial: SoloRoundView;
  onNext: () => void;
  onScored: () => void;
}) {
  const [round, setRound] = useState(initial);
  const [offset, setOffset] = useState(() => initial.serverNow - Date.now());
  const now = useServerNow(offset, 100);

  const apply = useCallback((r: SoloRoundView) => {
    setRound(r);
    setOffset(r.serverNow - Date.now());
  }, []);

  // After the deadline, ask the server to score the round (it finalizes lazily on read).
  const scored = useRef(false);
  useEffect(() => {
    if (round.status !== "ANSWERING" || !round.answeringDeadline) return;
    const wait = Math.max(0, round.answeringDeadline - (Date.now() + offset)) + 1200;
    let t: ReturnType<typeof setTimeout>;
    const poll = () =>
      soloApi
        .round(round.id)
        .then(({ round: r }) => (r.status === "COMPLETE" ? apply(r) : (t = setTimeout(poll, 700))))
        .catch(() => (t = setTimeout(poll, 1500)));
    t = setTimeout(poll, wait);
    return () => clearTimeout(t);
  }, [round.status, round.answeringDeadline, round.id, offset, apply]);

  useEffect(() => {
    if (round.status === "COMPLETE" && !scored.current) {
      scored.current = true;
      onScored();
    }
  }, [round.status, onScored]);

  if (round.status === "PREDICTION") return <BidStep round={round} onBid={apply} onSkip={onNext} />;
  if (round.status === "ANSWERING") {
    if (round.answeringStartsAt && now < round.answeringStartsAt) {
      return <GetReady round={round} secs={Math.ceil((round.answeringStartsAt - now) / 1000)} />;
    }
    if (round.answeringDeadline && now <= round.answeringDeadline) return <AnswerStep round={round} now={now} />;
    return (
      <div className="panel grid place-items-center gap-3 p-10 text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}>
          <Trophy className="size-10 text-volt" />
        </motion.div>
        <p className="font-display text-3xl font-black uppercase">Time&apos;s up!</p>
        <p className="text-muted-foreground">Counting your answers…</p>
      </div>
    );
  }
  return <ResultStep round={round} onNext={onNext} />;
}

function BidStep({ round, onBid, onSkip }: { round: SoloRoundView; onBid: (r: SoloRoundView) => void; onSkip: () => void }) {
  const [bid, setBid] = useState(5);
  const [busy, setBusy] = useState(false);
  async function lock() {
    setBusy(true);
    try {
      onBid((await soloApi.bid(round.id, bid)).round);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't lock your bid.");
      setBusy(false);
    }
  }
  async function skip() {
    setBusy(true);
    try {
      await soloApi.skip(round.id);
      onSkip();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't skip.");
      setBusy(false);
    }
  }
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-uv-soft">Solo round · place your bid</p>
      <TopicCard topic={round.topic} />
      <h2 className="mt-8 font-display text-4xl font-black uppercase sm:text-5xl">
        How many <span className="text-uv-soft">can you name?</span>
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{round.roundDuration} seconds on the clock once you lock in.</p>
      <div className="mt-6">
        <Stepper value={bid} onChange={setBid} min={MIN_PREDICTION} max={MAX_PREDICTION} size="xl" label="bid" disabled={busy} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Hit it for <b className="text-volt">{calculatePoints(bid, bid)}+</b> points (2 per answer, +1 for every extra). Fall
        short and it&apos;s <b className="text-hot">zero</b>.
      </p>
      <ArcadeButton variant="uv" size="xl" className="mt-6 w-full max-w-sm" loading={busy} onClick={lock}>
        <Lock className="size-5" /> Lock in {bid}
      </ArcadeButton>
      <button
        onClick={skip}
        disabled={busy}
        className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-faint hover:text-text disabled:opacity-50"
      >
        <SkipForward className="size-4" /> Skip this topic
      </button>
    </div>
  );
}

function GetReady({ round, secs }: { round: SoloRoundView; secs: number }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan">Bid locked · {round.predictedCount}</p>
      <p className="mt-2 font-display text-5xl font-black uppercase text-volt-glow sm:text-7xl">{round.topic.name}</p>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={secs}
          initial={{ scale: 2.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          className="mt-8 block font-display text-9xl font-black"
        >
          {secs}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function AnswerStep({ round, now }: { round: SoloRoundView; now: number }) {
  const [entries, setEntries] = useState<Entry[]>(() =>
    round.answers.map((a, i) => ({
      key: -i - 1,
      text: a.text,
      canonical: a.canonical,
      status: a.isDuplicate ? "dupe" : a.isValid ? "valid" : "invalid",
      corrected: false,
    })),
  );
  const [text, setText] = useState("");
  const [valid, setValid] = useState(round.validCount);
  const keyRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const bid = round.predictedCount ?? 0;
  const msLeft = Math.max(0, (round.answeringDeadline ?? 0) - now);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText("");
    inputRef.current?.focus();
    const key = ++keyRef.current;
    try {
      const r = await soloApi.answer(round.id, t);
      setValid(r.validCount);
      setEntries((list) => [
        {
          key,
          text: t,
          canonical: r.canonicalAnswer,
          status: r.isDuplicate ? "dupe" : r.isValid ? "valid" : "invalid",
          corrected: r.corrected,
        },
        ...list,
      ]);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't send that answer.");
    }
  }

  const met = valid >= bid;
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan">Name as many</p>
          <h2 className="font-display text-4xl font-black uppercase leading-none sm:text-6xl">{round.topic.name}</h2>
        </div>
        <CountdownRing msLeft={msLeft} totalMs={round.roundDuration * 1000} size={84} />
      </div>
      <div className="panel mt-5 p-5">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-6xl font-black tabular">
            <span className={met ? "text-volt" : "text-text"}>{valid}</span>
            <span className="text-faint">/{bid}</span>
          </span>
          <span className={cn("font-display text-xl font-extrabold uppercase", met ? "text-volt" : "text-muted-foreground")}>
            {met ? `Bid met · +${calculatePoints(valid, bid)}` : `${bid - valid} to go`}
          </span>
        </div>
        <Tally count={valid} target={bid} className="mt-3 min-h-9" />
      </div>
      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          ref={inputRef}
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={80}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Type an answer, hit Enter"
          className="h-16 min-w-0 flex-1 rounded-2xl border-2 border-volt/60 bg-ink/70 px-5 text-xl font-semibold placeholder:text-faint focus:border-volt focus:outline-none"
        />
        <ArcadeButton type="submit" size="lg" className="h-16 px-5" aria-label="Submit answer">
          <CornerDownLeft className="size-6" />
        </ArcadeButton>
      </form>
      <p className="mt-2 text-xs text-faint">Typos are autocorrected · duplicates caught instantly</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        <AnimatePresence initial={false}>
          {entries.map((e) => (
            <motion.li
              key={e.key}
              layout
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm",
                e.status === "valid" && "border-volt/40 bg-volt/10 font-semibold text-volt",
                e.status === "dupe" && "border-amber/50 bg-amber/10 text-amber",
                e.status === "invalid" && "border-hot/50 bg-hot/10 text-hot line-through",
              )}
            >
              {e.status === "valid" ? <Check className="size-3.5" /> : e.status === "dupe" ? <Copy className="size-3.5" /> : <X className="size-3.5" />}
              {e.text}
              {e.status === "valid" && e.canonical && e.canonical.toLowerCase() !== e.text.toLowerCase() && (
                <span className="flex items-center gap-1 text-xs opacity-80">
                  {e.corrected && <Sparkles className="size-3" aria-label="autocorrected" />}→ {e.canonical}
                </span>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function ResultStep({ round, onNext }: { round: SoloRoundView; onNext: () => void }) {
  const hit = (round.points ?? 0) > 0;
  const [all, setAll] = useState(false);
  const key = round.answerKey ?? [];
  const shown = all ? key : key.slice(0, 48);
  const rejected = [...new Map(round.answers.filter((a) => !a.isValid && !a.isDuplicate).map((a) => [a.text.toLowerCase(), a])).values()];
  return (
    <div className="flex flex-col items-center text-center">
      {hit && <Confetti />}
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan">{round.topic.name}</p>
      <motion.div
        initial={{ scale: 2, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: -3, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
        className={cn(
          "mt-4 rounded-3xl px-10 py-4 font-display text-6xl font-black uppercase sm:text-7xl",
          hit
            ? "bg-volt text-[#0a0d00] shadow-[0_8px_0_var(--volt-deep),0_0_70px_rgb(200_255_46/0.45)]"
            : "border-4 border-hot text-hot shadow-[0_0_40px_rgb(255_77_126/0.3)]",
        )}
      >
        {hit ? `+${round.points}` : "Bust · 0"}
      </motion.div>
      <p className="mt-5 text-lg text-muted-foreground">
        You bid <b className="text-text">{round.predictedCount}</b> and named <b className="text-text">{round.validCount}</b>
        {hit
          ? ` — ${round.predictedCount} × 2${round.validCount > (round.predictedCount ?? 0) ? ` + ${round.validCount - (round.predictedCount ?? 0)} extra` : ""}.`
          : `. ${(round.predictedCount ?? 0) - round.validCount} short.`}
      </p>
      <ArcadeButton size="xl" className="mt-6 w-full max-w-sm" onClick={onNext}>
        Next round
      </ArcadeButton>

      {rejected.length > 0 && (
        <div className="panel mt-8 w-full p-5 text-left">
          <h3 className="font-display text-2xl font-extrabold uppercase">Think we got one wrong?</h3>
          <p className="mb-3 text-sm text-muted-foreground">
            If a rejected answer really belongs in {round.topic.name}, appeal it. We&apos;ll review it and may add it.
          </p>
          <ul className="flex flex-wrap gap-2">
            {rejected.map((a) => (
              <li key={a.text} className="flex items-center gap-1.5 rounded-full border border-hot/40 bg-hot/10 py-1 pl-3 pr-1.5 text-sm text-hot">
                <span className="line-through">{a.text}</span>
                <AppealButton topicId={round.topic.id} text={a.text} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {key.length > 0 && (
        <div className="panel mt-8 w-full p-5 text-left">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-2xl font-extrabold uppercase">The full list</h3>
            <span className="text-sm text-muted-foreground">
              you found <b className="text-volt">{key.filter((k) => k.named).length}</b> of {key.length}
            </span>
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {shown.map((a) => (
              <li
                key={a.answer}
                className={cn(
                  "rounded-lg border px-2 py-1 text-sm",
                  a.named ? "border-volt/50 bg-volt/10 text-volt" : "border-line bg-night/40 text-faint",
                )}
              >
                {a.answer}
              </li>
            ))}
          </ul>
          {key.length > 48 && (
            <button onClick={() => setAll((v) => !v)} className="mt-3 text-sm font-semibold text-cyan hover:underline">
              {all ? "Show fewer" : `Show all ${key.length}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
