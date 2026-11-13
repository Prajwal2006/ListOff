"use client";

import { useMemo } from "react";
import { useClientValue } from "@/lib/client/use-client-value";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Backdrop } from "@/components/brand/backdrop";
import { Logo } from "@/components/brand/logo";
import { sessionStore } from "@/lib/client/storage";

/** Games hosted from this browser — the host key lives here, so this is the moderator's history. */
export default function HostedGamesPage() {
  const raw = useClientValue<string | null>(() => sessionStore.hostedRaw(), null);
  const games = useMemo<{ code: string; name: string; createdAt: number }[] | null>(() => {
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }, [raw]);
  return (
    <main className="relative min-h-dvh">
      <Backdrop />
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo size="sm" />
      </header>
      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <h1 className="font-display text-5xl font-black uppercase">Your games</h1>
        <p className="mt-1 text-muted-foreground">Games you&apos;ve hosted on this device.</p>
        <div className="mt-6 space-y-2">
          <Link
            href="/create"
            className="flex items-center gap-3 rounded-2xl border border-dashed border-volt/50 bg-volt/5 p-4 font-display text-xl font-extrabold uppercase text-volt hover:bg-volt/10"
          >
            <Plus className="size-5" /> Host a new game
          </Link>
          {games?.length === 0 && <p className="py-8 text-center text-faint">No hosted games yet.</p>}
          {games?.map((g) => (
            <Link
              key={g.code}
              href={`/dashboard/${g.code}`}
              className="panel flex items-center gap-4 p-4 transition hover:border-line-strong"
            >
              <span className="font-mono text-lg font-bold tracking-[0.25em] text-cyan">{g.code}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{g.name}</span>
                <span className="text-xs text-faint">{new Date(g.createdAt).toLocaleString()}</span>
              </span>
              <ArrowRight className="size-5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
