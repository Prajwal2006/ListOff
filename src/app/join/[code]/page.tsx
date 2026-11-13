"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { Backdrop } from "@/components/brand/backdrop";
import { Logo } from "@/components/brand/logo";
import { ArcadeButton } from "@/components/game/arcade-button";
import { api, ApiError } from "@/lib/client/api";
import { sessionStore } from "@/lib/client/storage";
import { useClientValue } from "@/lib/client/use-client-value";

type Preview = Awaited<ReturnType<typeof api.preview>>;

export default function JoinCodePage() {
  const { code: raw } = useParams<{ code: string }>();
  const code = raw.toUpperCase();
  const router = useRouter();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastName = useClientValue(() => sessionStore.lastName(), "");
  const [typed, setName] = useState<string | null>(null);
  const name = typed ?? lastName;
  const seated = useClientValue(() => sessionStore.playerRaw(code) !== null, false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Already seated in this game? Go straight back in.
    if (seated) {
      router.replace(`/game/${code}`);
      return;
    }
    api
      .preview(code)
      .then(setPreview)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn't find that game."));
  }, [code, router, seated]);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.join(code, name);
      sessionStore.setPlayer(code, { token: res.token, participantId: res.participantId, displayName: res.displayName });
      router.push(`/game/${code}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't join. Try again.");
      setBusy(false);
    }
  }

  return (
    <main className="relative grid min-h-dvh place-items-center px-4 py-10">
      <Backdrop tone="uv" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-md flex-col items-center gap-6 text-center"
      >
        <Logo size="md" />
        {error ? (
          <div className="panel w-full p-6">
            <h1 className="font-display text-4xl font-black uppercase">Room not found</h1>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <ArcadeButton variant="ghost" size="md" className="mt-5" onClick={() => router.push("/join")}>
              Try another code
            </ArcadeButton>
          </div>
        ) : !preview ? (
          <div className="h-64 w-full animate-pulse rounded-3xl bg-night/60" />
        ) : (
          <div className="panel w-full p-6 sm:p-8">
            <p className="font-mono text-sm tracking-[0.4em] text-cyan">{preview.code}</p>
            <h1 className="mt-1 font-display text-4xl font-black uppercase leading-none sm:text-5xl">{preview.name}</h1>
            <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              {preview.hostName && <span>Hosted by {preview.hostName} ·</span>}
              <Users className="size-4" /> {preview.playerCount} in the lobby · {preview.totalRounds} rounds
            </p>
            {preview.joinable ? (
              <form onSubmit={join} className="mt-6 space-y-4">
                <label className="block text-left">
                  <span className="mb-2 block text-sm font-semibold text-muted-foreground">Your display name</span>
                  <input
                    autoFocus
                    required
                    maxLength={20}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Fruit Ninja"
                    className="h-16 w-full rounded-2xl border border-line-strong bg-ink/60 px-4 text-center font-display text-3xl font-extrabold uppercase tracking-wide placeholder:text-faint focus:border-volt focus:outline-none"
                  />
                </label>
                <ArcadeButton type="submit" size="xl" className="w-full" loading={busy} disabled={!name.trim()}>
                  Join game
                </ArcadeButton>
              </form>
            ) : (
              <p className="mt-6 rounded-2xl border border-hot/40 bg-hot/10 p-4 text-hot">
                This game has already started, so new players can&apos;t join. Ask the host to start a new one.
              </p>
            )}
          </div>
        )}
      </motion.div>
    </main>
  );
}
