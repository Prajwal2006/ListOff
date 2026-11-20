"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CategoryPicker } from "@/components/game/category-picker";
import { ChoiceChips, Stepper } from "@/components/game/stepper";
import { api, ApiError } from "@/lib/client/api";
import { MAX_ROUNDS, MIN_ROUNDS, ROUND_DURATION_OPTIONS } from "@/lib/game-engine/state-machine";
import type { GameInfo } from "@/types/game";

type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Lobby settings. Every change saves automatically (debounced), so what the host sees selected is
 * always what the game uses — there is no separate "Save" step to forget.
 */
export function SettingsPanel({ game, token, onSaved }: { game: GameInfo; token: string; onSaved: () => void }) {
  const [rounds, setRounds] = useState(game.totalRounds);
  const [duration, setDuration] = useState(game.roundDuration);
  const [prediction, setPrediction] = useState(game.predictionDuration);
  const [cats, setCats] = useState<number[]>(game.categoryIds ?? []);
  const [state, setState] = useState<SaveState>("idle");
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setState("saving");
      try {
        await api.settings(game.code, token, {
          totalRounds: rounds,
          roundDuration: duration,
          predictionDuration: prediction,
          categoryIds: cats.length ? cats : null,
        });
        if (cancelled) return;
        setState("saved");
        onSaved();
      } catch (e) {
        if (cancelled) return;
        setState("error");
        toast.error(e instanceof ApiError ? e.message : "Couldn't save settings.");
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rounds, duration, prediction, cats]);

  return (
    <section className="panel space-y-5 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-extrabold uppercase">Game settings</h2>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground" aria-live="polite">
          {state === "saving" && (
            <>
              <Loader2 className="size-3.5 animate-spin" /> Saving…
            </>
          )}
          {state === "saved" && (
            <>
              <Check className="size-3.5 text-volt" /> Saved
            </>
          )}
          {state === "idle" && "Changes save automatically"}
          {state === "error" && <span className="text-hot">Not saved — try again</span>}
        </span>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <span className="mb-2 block text-sm font-semibold text-muted-foreground">Rounds</span>
          <Stepper value={rounds} onChange={setRounds} min={MIN_ROUNDS} max={MAX_ROUNDS} label="rounds" />
        </div>
        <div className="space-y-4">
          <div>
            <span className="mb-2 block text-sm font-semibold text-muted-foreground">Answer time</span>
            <ChoiceChips label="Answer time" options={ROUND_DURATION_OPTIONS} value={duration as 20} onChange={setDuration} format={(v) => `${v}s`} />
          </div>
          <div>
            <span className="mb-2 block text-sm font-semibold text-muted-foreground">Bid time</span>
            <ChoiceChips label="Bid time" options={[15, 20, 30, 45, 60] as const} value={prediction as 30} onChange={setPrediction} format={(v) => `${v}s`} />
          </div>
        </div>
      </div>
      <div>
        <span className="mb-2 block text-sm font-semibold text-muted-foreground">Categories</span>
        <CategoryPicker value={cats} onChange={setCats} />
      </div>
    </section>
  );
}
