"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArcadeButton } from "@/components/game/arcade-button";
import { CategoryPicker } from "@/components/game/category-picker";
import { ChoiceChips, Stepper } from "@/components/game/stepper";
import { api, ApiError } from "@/lib/client/api";
import { MAX_ROUNDS, MIN_ROUNDS, ROUND_DURATION_OPTIONS } from "@/lib/game-engine/state-machine";
import type { GameInfo } from "@/types/game";

export function SettingsPanel({ game, token, onSaved }: { game: GameInfo; token: string; onSaved: () => void }) {
  const [rounds, setRounds] = useState(game.totalRounds);
  const [duration, setDuration] = useState(game.roundDuration);
  const [prediction, setPrediction] = useState(game.predictionDuration);
  const [cats, setCats] = useState<number[]>(game.categoryIds ?? []);
  const [busy, setBusy] = useState(false);

  const dirty =
    rounds !== game.totalRounds ||
    duration !== game.roundDuration ||
    prediction !== game.predictionDuration ||
    JSON.stringify([...cats].sort()) !== JSON.stringify([...(game.categoryIds ?? [])].sort());

  async function save() {
    setBusy(true);
    try {
      await api.settings(game.code, token, {
        totalRounds: rounds,
        roundDuration: duration,
        predictionDuration: prediction,
        categoryIds: cats.length ? cats : null,
      });
      toast.success("Settings saved");
      onSaved();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't save settings.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel space-y-5 p-5">
      <h2 className="font-display text-2xl font-extrabold uppercase">Game settings</h2>
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
      <ArcadeButton variant="ghost" size="md" disabled={!dirty} loading={busy} onClick={save}>
        Save settings
      </ArcadeButton>
    </section>
  );
}
