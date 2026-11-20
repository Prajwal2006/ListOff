"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Flag, LogOut, MapPin, Pencil, Play, Target, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";
import { Backdrop } from "@/components/brand/backdrop";
import { Logo } from "@/components/brand/logo";
import { ArcadeButton } from "@/components/game/arcade-button";
import { ProfileForm } from "@/components/solo/profile-form";
import { SoloRound } from "@/components/solo/solo-round";
import { authClient } from "@/lib/auth/client";
import { ApiError } from "@/lib/client/api";
import { soloApi } from "@/lib/client/solo-api";
import type { MeResponse, SoloProfileView, SoloRoundView } from "@/types/solo";

export default function SoloPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [round, setRound] = useState<SoloRoundView | null>(null);
  const [editing, setEditing] = useState(false);
  const [starting, setStarting] = useState(false);

  const refreshMe = useCallback(async () => {
    try {
      const m = await soloApi.me();
      setMe(m);
      if (m.authEnabled && !m.user) router.replace("/login?next=/solo");
    } catch {
      toast.error("Couldn't load your account. Refresh to try again.");
    }
  }, [router]);

  useEffect(() => {
    let live = true;
    soloApi
      .me()
      .then((m) => {
        if (!live) return;
        setMe(m);
        if (m.authEnabled && !m.user) router.replace("/login?next=/solo");
      })
      .catch(() => toast.error("Couldn't load your account. Refresh to try again."));
    return () => {
      live = false;
    };
  }, [router]);

  async function play() {
    setStarting(true);
    try {
      setRound((await soloApi.start()).round);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't start a round.");
    } finally {
      setStarting(false);
    }
  }

  async function signOut() {
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  }

  const profile = me?.profile;

  return (
    <main className="relative min-h-dvh">
      <Backdrop tone={round ? "volt" : "uv"} />
      <header className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo size="sm" />
        <nav className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
          <Link href="/leaderboards" className="flex items-center gap-1.5 rounded-lg px-3 py-2 hover:text-text">
            <Trophy className="size-4" /> Leaderboards
          </Link>
          {me?.user && (
            <button onClick={signOut} className="flex items-center gap-1.5 rounded-lg px-3 py-2 hover:text-text" aria-label="Sign out">
              <LogOut className="size-4" /> <span className="hidden sm:inline">Sign out</span>
            </button>
          )}
        </nav>
      </header>

      <div className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
        {!me ? (
          <div className="h-96 animate-pulse rounded-3xl bg-night/60" />
        ) : !me.authEnabled ? (
          <div className="panel p-8 text-center">
            <h1 className="font-display text-4xl font-black uppercase">Solo mode is offline</h1>
            <p className="mt-2 text-muted-foreground">Accounts aren&apos;t configured on this server yet.</p>
          </div>
        ) : !me.user ? (
          <div className="h-96 animate-pulse rounded-3xl bg-night/60" />
        ) : !profile || editing ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl">
            <h1 className="font-display text-5xl font-black uppercase leading-none">
              {profile ? "Edit profile" : <>Rep your <span className="text-volt-glow">turf</span></>}
            </h1>
            <p className="mt-3 text-muted-foreground">
              Your solo points count toward three leaderboards: your country, your state and your university.
            </p>
            <div className="panel mt-6 p-6">
              <ProfileForm
                initial={profile}
                defaultName={me.user.name}
                submitLabel={profile ? "Save changes" : "Save and play"}
                onSaved={(p) => {
                  setMe({ ...me, profile: p });
                  setEditing(false);
                  toast.success("Profile saved");
                }}
              />
              {profile && (
                <button onClick={() => setEditing(false)} className="mt-4 w-full text-sm font-semibold text-faint hover:text-text">
                  Cancel
                </button>
              )}
            </div>
          </motion.div>
        ) : round ? (
          <AnimatePresence mode="wait">
            <motion.div key={round.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <SoloRound initial={round} onNext={play} onScored={refreshMe} />
            </motion.div>
          </AnimatePresence>
        ) : (
          <Hub profile={profile} starting={starting} onPlay={play} onEdit={() => setEditing(true)} />
        )}
      </div>
    </main>
  );
}

function Hub({
  profile,
  starting,
  onPlay,
  onEdit,
}: {
  profile: SoloProfileView;
  starting: boolean;
  onPlay: () => void;
  onEdit: () => void;
}) {
  const hitRate = profile.roundsPlayed ? Math.round((profile.bidsHit / profile.roundsPlayed) * 100) : 0;
  const ranks = [
    { Icon: Flag, label: profile.country === "IN" ? "India" : "USA", rank: profile.ranks.national, scope: "national" },
    { Icon: MapPin, label: profile.stateName, rank: profile.ranks.state, scope: "state" },
    { Icon: Building2, label: profile.university.name, rank: profile.ranks.university, scope: "university" },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-uv-soft">Solo mode</p>
          <h1 className="font-display text-5xl font-black uppercase leading-none sm:text-6xl">{profile.displayName}</h1>
        </div>
        <button onClick={onEdit} className="flex items-center gap-1.5 text-sm font-semibold text-cyan hover:underline">
          <Pencil className="size-4" /> Edit profile
        </button>
      </div>

      <div className="panel mt-6 grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
        <div className="text-center sm:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Total points</p>
          <motion.p
            key={profile.totalPoints}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display text-8xl font-black leading-none tabular text-volt-glow"
          >
            {profile.totalPoints.toLocaleString()}
          </motion.p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { Icon: Play, n: profile.roundsPlayed, l: "rounds" },
            { Icon: Target, n: `${hitRate}%`, l: "bids hit" },
            { Icon: Zap, n: profile.bestRound, l: "best round" },
          ].map(({ Icon, n, l }) => (
            <div key={l} className="rounded-2xl border border-line bg-ink/40 p-3">
              <Icon className="mx-auto size-5 text-cyan" />
              <p className="mt-1 font-display text-3xl font-black tabular">{n}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {ranks.map(({ Icon, label, rank, scope }) => (
          <Link key={scope} href={`/leaderboards?scope=${scope}`} className="panel group p-5 transition hover:border-volt/50">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <Icon className="size-4 text-uv-soft" /> {scope}
            </p>
            <p className="mt-1 truncate font-semibold" title={label}>
              {label}
            </p>
            <p className="mt-2 font-display text-5xl font-black tabular group-hover:text-volt">{rank ? `#${rank}` : "—"}</p>
          </Link>
        ))}
      </div>

      <ArcadeButton size="xl" className="mt-8 w-full" loading={starting} onClick={onPlay}>
        <Play className="size-6" /> Play a round
      </ArcadeButton>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Random topic · bid how many you can name · 30 seconds · points add to your total.
      </p>
    </motion.div>
  );
}
