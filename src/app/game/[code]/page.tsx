"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { Backdrop } from "@/components/brand/backdrop";
import { ArcadeButton } from "@/components/game/arcade-button";
import { GameHeader } from "@/components/game/game-header";
import { AnsweringView } from "@/components/game/phases/answering-view";
import { FinalView } from "@/components/game/phases/final-view";
import { LobbyView } from "@/components/game/phases/lobby-view";
import { PredictionView } from "@/components/game/phases/prediction-view";
import { ProcessingView } from "@/components/game/phases/processing-view";
import { ResultsView } from "@/components/game/phases/results-view";
import { RevealView } from "@/components/game/phases/reveal-view";
import { parsePlayer, sessionStore } from "@/lib/client/storage";
import { useClientValue } from "@/lib/client/use-client-value";
import { useServerNow } from "@/lib/realtime/use-countdown";
import { useGameSync } from "@/lib/realtime/use-game-sync";
import type { GameSnapshot } from "@/types/game";

type Phase = "lobby" | "prediction" | "reveal" | "answering" | "processing" | "results" | "final" | "loading";

function phaseOf(s: GameSnapshot | null, now: number): Phase {
  if (!s) return "loading";
  const r = s.round;
  switch (s.game.state) {
    case "LOBBY":
      return "lobby";
    case "PREDICTION":
      return "prediction";
    case "TOPIC_REVEAL":
      return r?.answeringStartsAt && now >= r.answeringStartsAt ? "answering" : "reveal";
    case "ANSWERING":
      return r?.answeringDeadline && now >= r.answeringDeadline ? "processing" : "answering";
    case "ROUND_PROCESSING":
      return "processing";
    case "ROUND_LEADERBOARD":
      return s.results ? "results" : "processing";
    case "GAME_FINISHED":
      return "final";
  }
}

export default function GamePage() {
  const { code: raw } = useParams<{ code: string }>();
  const code = raw.toUpperCase();
  const router = useRouter();
  const storedSession = useClientValue<string | null | undefined>(() => sessionStore.playerRaw(code), undefined);
  const session = useMemo(
    () => (storedSession === undefined ? undefined : parsePlayer(storedSession)),
    [storedSession],
  );

  useEffect(() => {
    if (session === null) router.replace(`/join/${code}`);
  }, [session, code, router]);

  const auth = useMemo(() => (session ? ({ kind: "player", token: session.token } as const) : null), [session]);
  const { snapshot, offset, connected, error, refresh } = useGameSync(code, auth);
  const now = useServerNow(offset, 200);
  const phase = phaseOf(snapshot, now);

  // Session revoked or game gone: start over at the join screen.
  useEffect(() => {
    if (error?.status === 401) {
      sessionStore.clearPlayer(code);
      router.replace(`/join/${code}`);
    }
  }, [error, code, router]);

  // Rematch: carry the seat over to the new room automatically.
  const next = snapshot?.game.nextGameCode;
  useEffect(() => {
    if (!next || !session) return;
    const t = setTimeout(() => {
      sessionStore.setPlayer(next, session);
      router.push(`/game/${next}`);
    }, 4000);
    return () => clearTimeout(t);
  }, [next, session, router]);

  if (error && error.status === 404) {
    return (
      <main className="grid min-h-dvh place-items-center px-4 text-center">
        <Backdrop tone="hot" />
        <div>
          <h1 className="font-display text-5xl font-black uppercase">Game not found</h1>
          <p className="mt-2 text-muted-foreground">{error.message}</p>
          <ArcadeButton variant="ghost" size="md" className="mt-6" onClick={() => router.push("/join")}>
            Enter another code
          </ArcadeButton>
        </div>
      </main>
    );
  }

  const tone = phase === "answering" || phase === "reveal" ? "volt" : phase === "prediction" ? "uv" : "default";
  const s = snapshot;

  return (
    <main className="relative min-h-dvh">
      <Backdrop tone={tone} />
      <GameHeader
        snapshot={s}
        connected={connected}
        right={
          <button
            onClick={() => {
              if (confirm("Leave this game on this device? You can rejoin with the same link while it's in the lobby.")) {
                sessionStore.clearPlayer(code);
                router.push("/");
              }
            }}
            className="grid size-8 place-items-center rounded-full border border-line text-muted-foreground hover:text-text"
            title="Leave game"
          >
            <LogOut className="size-4" />
            <span className="sr-only">Leave game</span>
          </button>
        }
      />

      {next && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-auto mb-2 flex max-w-5xl items-center justify-between gap-3 rounded-2xl border border-volt/50 bg-volt/10 px-4 py-3 sm:mx-6"
        >
          <span className="font-semibold">The host started a rematch — moving you in…</span>
          <ArcadeButton
            size="md"
            onClick={() => {
              if (session) sessionStore.setPlayer(next, session);
              router.push(`/game/${next}`);
            }}
          >
            Join now
          </ArcadeButton>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={`${phase}-${s?.round?.id ?? "none"}`}
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
          transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
        >
          {phase === "loading" && <ProcessingView label="Joining" />}
          {s && phase === "lobby" && <LobbyView snapshot={s} />}
          {s && phase === "prediction" && session && s.round && (
            <PredictionView snapshot={s} token={session.token} offset={offset} onLocked={refresh} />
          )}
          {s && phase === "reveal" && s.round?.topic && (
            <RevealView
              topic={s.round.topic}
              answeringStartsAt={s.round.answeringStartsAt}
              offset={offset}
              bid={s.me?.round?.prediction}
              roundNumber={s.round.number}
            />
          )}
          {s && phase === "answering" && session && s.round?.topic && s.round.answeringDeadline && (
            <AnsweringView
              code={code}
              token={session.token}
              topic={s.round.topic}
              bid={s.me?.round?.prediction ?? null}
              deadline={s.round.answeringDeadline}
              totalMs={s.game.roundDuration * 1000}
              offset={offset}
              initial={s.me?.round?.answers ?? []}
            />
          )}
          {phase === "processing" && <ProcessingView />}
          {s && phase === "results" && <ResultsView snapshot={s} />}
          {s && phase === "final" && s.final && <FinalView final={s.final} meId={s.me?.id} gameName={s.game.name} />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
