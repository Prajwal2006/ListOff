"use client";

import { useMemo, useState } from "react";
import { useClientValue } from "@/lib/client/use-client-value";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Flag, Play, RotateCcw, SkipForward, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Backdrop } from "@/components/brand/backdrop";
import { ArcadeButton } from "@/components/game/arcade-button";
import { GameHeader, PhaseLabel } from "@/components/game/game-header";
import { PlayerGrid } from "@/components/game/player-grid";
import { FinalView } from "@/components/game/phases/final-view";
import { useJoinToasts } from "@/components/game/phases/lobby-view";
import { ProcessingView } from "@/components/game/phases/processing-view";
import { RevealView } from "@/components/game/phases/reveal-view";
import { HostAnswering, HostPrediction, HostResults } from "@/components/moderator/host-round-views";
import { SettingsPanel } from "@/components/moderator/settings-panel";
import { ShareCard } from "@/components/moderator/share-card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/client/api";
import { sessionStore } from "@/lib/client/storage";
import { useServerNow } from "@/lib/realtime/use-countdown";
import { useGameSync } from "@/lib/realtime/use-game-sync";

type Action = "start" | "next" | "reveal" | "end" | "play-again";

export default function DashboardPage() {
  const { code: raw } = useParams<{ code: string }>();
  const code = raw.toUpperCase();
  const router = useRouter();
  const token = useClientValue<string | null | undefined>(() => sessionStore.getHost(code), undefined);
  const [busy, setBusy] = useState<Action | null>(null);

  const auth = useMemo(() => (token ? ({ kind: "host", token } as const) : null), [token]);
  const { snapshot: s, offset, connected, error, refresh } = useGameSync(code, auth);
  const now = useServerNow(offset, 250);
  useJoinToasts(s);

  async function act(action: Action) {
    if (!token) return;
    setBusy(action);
    try {
      const res = await api.control(code, token, action);
      if (action === "play-again" && res.nextGameCode) {
        sessionStore.setHost(res.nextGameCode, token, s?.game.name ?? "ListOff");
        router.push(`/dashboard/${res.nextGameCode}`);
        return;
      }
      refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "That didn't work. Try again.");
    } finally {
      setBusy(null);
    }
  }

  if (token === null || error?.status === 403 || error?.status === 401) {
    return (
      <main className="grid min-h-dvh place-items-center px-4 text-center">
        <Backdrop tone="hot" />
        <div className="max-w-md">
          <h1 className="font-display text-5xl font-black uppercase">Host access only</h1>
          <p className="mt-2 text-muted-foreground">
            This browser doesn&apos;t hold the host key for game {code}. Open the dashboard on the device that created the
            game, or join as a player instead.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <ArcadeButton variant="ghost" size="md" onClick={() => router.push(`/join/${code}`)}>
              Join as player
            </ArcadeButton>
            <ArcadeButton size="md" onClick={() => router.push("/create")}>
              Host a new game
            </ArcadeButton>
          </div>
        </div>
      </main>
    );
  }
  if (error?.status === 404) {
    return (
      <main className="grid min-h-dvh place-items-center px-4 text-center">
        <Backdrop tone="hot" />
        <h1 className="font-display text-5xl font-black uppercase">Game not found</h1>
      </main>
    );
  }

  const state = s?.game.state;
  const round = s?.round;
  const answeringOver = state === "ANSWERING" && round?.answeringDeadline && now >= round.answeringDeadline;
  const revealing = state === "TOPIC_REVEAL" && round?.answeringStartsAt && now < round.answeringStartsAt;
  const finalRound = s ? s.game.currentRound >= s.game.totalRounds : false;

  return (
    <main className="relative min-h-dvh">
      <Backdrop tone={state === "ANSWERING" || state === "TOPIC_REVEAL" ? "volt" : state === "PREDICTION" ? "uv" : "default"} />
      <GameHeader
        snapshot={s}
        connected={connected}
        right={
          <Link href="/dashboard" className="hidden text-sm font-semibold text-muted-foreground hover:text-text sm:inline">
            My games
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-5xl px-4 pb-32 sm:px-6">
        {!s ? (
          <ProcessingView label="Loading" />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${state}-${round?.id ?? "x"}-${revealing ? "r" : ""}${answeringOver ? "o" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {state === "LOBBY" && (
                <div className="space-y-6">
                  <div>
                    <PhaseLabel>Host dashboard · lobby</PhaseLabel>
                    <h1 className="mt-1 font-display text-5xl font-black uppercase leading-none sm:text-7xl">{s.game.name}</h1>
                  </div>
                  <ShareCard code={code} big />
                  <section className="panel p-5">
                    <div className="mb-3 flex items-baseline justify-between">
                      <h2 className="font-display text-2xl font-extrabold uppercase">Players in the lobby</h2>
                      <span className="font-display text-4xl font-black tabular text-volt">{s.participants.length}</span>
                    </div>
                    {s.participants.length === 0 ? (
                      <p className="py-6 text-center text-muted-foreground">Share the code — players appear here the moment they join.</p>
                    ) : (
                      <PlayerGrid players={s.participants} />
                    )}
                  </section>
                  {token && (
                    <SettingsPanel
                      key={`${s.game.totalRounds}-${s.game.roundDuration}-${s.game.predictionDuration}-${(s.game.categoryIds ?? []).join(",")}`}
                      game={s.game}
                      token={token}
                      onSaved={refresh}
                    />
                  )}
                </div>
              )}

              {state === "PREDICTION" && <HostPrediction snapshot={s} offset={offset} />}

              {revealing && round?.topic && (
                <RevealView topic={round.topic} answeringStartsAt={round.answeringStartsAt} offset={offset} roundNumber={round.number} />
              )}

              {((state === "TOPIC_REVEAL" && !revealing) || (state === "ANSWERING" && !answeringOver)) && round?.topic && (
                <HostAnswering snapshot={s} offset={offset} />
              )}

              {(answeringOver || state === "ROUND_PROCESSING") && <ProcessingView />}

              {state === "ROUND_LEADERBOARD" && s.results && <HostResults snapshot={s} />}

              {state === "GAME_FINISHED" && s.final && <FinalView final={s.final} gameName={s.game.name} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Control dock */}
      {s && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="text-sm text-muted-foreground">
              <span className="font-display text-lg font-extrabold uppercase text-text">{labelFor(state)}</span>
              <span className="ml-2 hidden sm:inline">
                {s.participants.filter((p) => p.isConnected).length}/{s.participants.length} connected
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {state !== "GAME_FINISHED" && state !== "LOBBY" && (
                <EndGameButton onConfirm={() => act("end")} busy={busy === "end"} />
              )}
              {state === "LOBBY" && (
                <ArcadeButton onClick={() => act("start")} loading={busy === "start"} disabled={s.participants.length === 0}>
                  <Play className="size-5" /> Start game
                </ArcadeButton>
              )}
              {state === "PREDICTION" && (
                <ArcadeButton variant="uv" onClick={() => act("reveal")} loading={busy === "reveal"}>
                  <Eye className="size-5" /> Reveal now
                </ArcadeButton>
              )}
              {state === "ROUND_LEADERBOARD" && (
                <ArcadeButton onClick={() => act("next")} loading={busy === "next"}>
                  {finalRound ? (
                    <>
                      <Trophy className="size-5" /> Final standings
                    </>
                  ) : (
                    <>
                      <SkipForward className="size-5" /> Round {s.game.currentRound + 1}
                    </>
                  )}
                </ArcadeButton>
              )}
              {state === "GAME_FINISHED" && (
                <ArcadeButton onClick={() => act("play-again")} loading={busy === "play-again"}>
                  <RotateCcw className="size-5" /> Play again
                </ArcadeButton>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function labelFor(state?: string) {
  switch (state) {
    case "LOBBY":
      return "Lobby open";
    case "PREDICTION":
      return "Bidding";
    case "TOPIC_REVEAL":
      return "Topic revealed";
    case "ANSWERING":
      return "Answering";
    case "ROUND_PROCESSING":
      return "Tallying";
    case "ROUND_LEADERBOARD":
      return "Round results";
    case "GAME_FINISHED":
      return "Game over";
    default:
      return "";
  }
}

function EndGameButton({ onConfirm, busy }: { onConfirm: () => void; busy: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <ArcadeButton variant="ghost" size="lg" loading={busy}>
          <Flag className="size-5" /> End game
        </ArcadeButton>
      </DialogTrigger>
      <DialogContent className="border-line-strong bg-night">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl font-black uppercase">End the game now?</DialogTitle>
          <DialogDescription>
            Completed rounds keep their scores. The round in progress is cancelled and won&apos;t count. Everyone sees the
            final standings.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <ArcadeButton variant="ghost" size="md">
              Keep playing
            </ArcadeButton>
          </DialogClose>
          <DialogClose asChild>
            <ArcadeButton variant="hot" size="md" onClick={onConfirm}>
              End game
            </ArcadeButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
