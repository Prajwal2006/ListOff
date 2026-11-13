"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Backdrop } from "@/components/brand/backdrop";
import { Logo } from "@/components/brand/logo";
import { ArcadeButton } from "@/components/game/arcade-button";
import { CategoryPicker } from "@/components/game/category-picker";
import { ChoiceChips, Stepper } from "@/components/game/stepper";
import { api, ApiError } from "@/lib/client/api";
import { sessionStore } from "@/lib/client/storage";
import { MAX_ROUNDS, MIN_ROUNDS, ROUND_DURATION_OPTIONS } from "@/lib/game-engine/state-machine";

const PREDICTION_OPTIONS = [15, 20, 30, 45, 60] as const;

export default function CreatePage() {
  const router = useRouter();
  const [name, setName] = useState("Friday Night ListOff");
  const [hostName, setHostName] = useState("");
  const [rounds, setRounds] = useState(5);
  const [duration, setDuration] = useState<number>(20);
  const [predictionDuration, setPredictionDuration] = useState<number>(30);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { code, moderatorToken } = await api.createGame({
        name,
        hostName: hostName || undefined,
        totalRounds: rounds,
        roundDuration: duration,
        predictionDuration,
        categoryIds: categoryIds.length ? categoryIds : null,
      });
      sessionStore.setHost(code, moderatorToken, name);
      router.push(`/dashboard/${code}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't create the game.");
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-dvh">
      <Backdrop tone="uv" />
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo size="sm" />
      </header>
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl space-y-6 px-4 pb-16 sm:px-6"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-uv-soft">Host setup</p>
          <h1 className="font-display text-5xl font-black uppercase sm:text-6xl">Set the table</h1>
        </div>

        <section className="panel space-y-5 p-5 sm:p-6">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-muted-foreground">Game name</span>
            <input
              value={name}
              maxLength={40}
              required
              onChange={(e) => setName(e.target.value)}
              className="h-14 w-full rounded-2xl border border-line-strong bg-ink/60 px-4 font-display text-2xl font-bold uppercase tracking-wide focus:border-uv focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-muted-foreground">Your name (shown in the lobby, optional)</span>
            <input
              value={hostName}
              maxLength={20}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Quizmaster"
              className="h-12 w-full rounded-xl border border-line-strong bg-ink/60 px-4 text-lg focus:border-uv focus:outline-none"
            />
          </label>
        </section>

        <section className="panel grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <span className="mb-3 block text-sm font-semibold text-muted-foreground">Rounds</span>
            <Stepper value={rounds} onChange={setRounds} min={MIN_ROUNDS} max={MAX_ROUNDS} label="rounds" />
          </div>
          <div className="space-y-5">
            <div>
              <span className="mb-2 block text-sm font-semibold text-muted-foreground">Answer time</span>
              <ChoiceChips label="Answer time" options={ROUND_DURATION_OPTIONS} value={duration} onChange={setDuration} format={(v) => `${v}s`} />
            </div>
            <div>
              <span className="mb-2 block text-sm font-semibold text-muted-foreground">Time to place bids</span>
              <ChoiceChips
                label="Prediction time"
                options={PREDICTION_OPTIONS}
                value={predictionDuration}
                onChange={setPredictionDuration}
                format={(v) => `${v}s`}
              />
            </div>
          </div>
        </section>

        <section className="panel space-y-3 p-5 sm:p-6">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Categories</span>
            <span className="text-xs text-faint">Topics are dealt at random and never repeat in a game</span>
          </div>
          <CategoryPicker value={categoryIds} onChange={setCategoryIds} />
        </section>

        <ArcadeButton type="submit" size="xl" loading={busy} className="w-full">
          Create game
        </ArcadeButton>
      </motion.form>
    </main>
  );
}
