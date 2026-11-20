"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Crown, Flag, MapPin, Search, Trophy } from "lucide-react";
import { Backdrop } from "@/components/brand/backdrop";
import { Logo } from "@/components/brand/logo";
import { COUNTRIES, REGIONS, type CountryCode } from "@/data/regions";
import { soloApi } from "@/lib/client/solo-api";
import { cn } from "@/lib/utils";
import type { LeaderboardResponse, LeaderboardScope, MeResponse, UniversityView } from "@/types/solo";

const SCOPES: { id: LeaderboardScope; label: string; Icon: React.ElementType }[] = [
  { id: "national", label: "National", Icon: Flag },
  { id: "state", label: "State", Icon: MapPin },
  { id: "university", label: "University", Icon: Building2 },
];

const select =
  "h-12 w-full rounded-xl border border-line-strong bg-ink/60 px-3 text-base focus:border-volt focus:outline-none";

function Boards() {
  const params = useSearchParams();
  const initialScope = (["national", "state", "university"] as const).find((s) => s === params.get("scope")) ?? "national";
  const [me, setMe] = useState<MeResponse | null>(null);
  const [scope, setScope] = useState<LeaderboardScope>(initialScope);
  const [country, setCountry] = useState<CountryCode>("IN");
  const [stateCode, setStateCode] = useState("");
  const [uni, setUni] = useState<UniversityView | null>(null);
  const [uniQuery, setUniQuery] = useState("");
  const [uniResults, setUniResults] = useState<UniversityView[]>([]);
  const [board, setBoard] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Default to the viewer's own country / state / university.
  useEffect(() => {
    soloApi
      .me()
      .then((m) => {
        setMe(m);
        if (m.profile) {
          setCountry(m.profile.country);
          setStateCode(m.profile.stateCode);
          setUni(m.profile.university);
        } else setStateCode(REGIONS.IN[0].code);
      })
      .catch(() => setStateCode(REGIONS.IN[0].code));
  }, []);

  useEffect(() => {
    if (scope !== "university") return;
    let live = true;
    const t = setTimeout(() => {
      soloApi
        .universities(country, undefined, uniQuery.trim() || undefined)
        .then((r) => live && setUniResults(r.universities))
        .catch(() => {});
    }, 200);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [scope, country, uniQuery]);

  const query = useMemo(() => {
    if (scope === "state" && !stateCode) return null;
    if (scope === "university" && !uni) return null;
    return { scope, country, state: stateCode || undefined, university: uni?.id };
  }, [scope, country, stateCode, uni]);

  useEffect(() => {
    if (!query) return;
    let live = true;
    soloApi
      .leaderboard(query)
      .then((b) => {
        if (!live) return;
        setBoard(b);
        setError(null);
      })
      .catch(() => live && setError("Couldn't load this leaderboard."));
    return () => {
      live = false;
    };
  }, [query]);

  function pickCountry(c: CountryCode) {
    setCountry(c);
    setStateCode(me?.profile?.country === c ? me.profile.stateCode : REGIONS[c][0].code);
    setUni(me?.profile?.country === c ? me.profile.university : null);
    setUniQuery("");
  }

  const top3 = board?.entries.slice(0, 3) ?? [];
  const rest = board?.entries.slice(3) ?? [];
  const meVisible = board?.entries.some((e) => e.isMe);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber">Solo mode</p>
          <h1 className="font-display text-6xl font-black uppercase leading-none sm:text-7xl">
            Leader<span className="text-volt-glow">boards</span>
          </h1>
        </div>
        <Link
          href="/solo"
          className="rounded-2xl bg-volt px-5 py-3 font-display text-lg font-extrabold uppercase text-[#0a0d00] shadow-[0_5px_0_var(--volt-deep)] active:translate-y-1"
        >
          {me?.profile ? "Play solo" : "Join the boards"}
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-1 rounded-2xl border border-line bg-ink/50 p-1">
        {SCOPES.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setScope(id)}
            className={cn(
              "relative flex items-center justify-center gap-2 rounded-xl py-3 font-display text-base font-extrabold uppercase tracking-wide transition sm:text-lg",
              scope === id ? "text-[#0a0d00]" : "text-muted-foreground hover:text-text",
            )}
          >
            {scope === id && (
              <motion.span layoutId="lb-tab" className="absolute inset-0 rounded-xl bg-volt" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
            )}
            <Icon className="relative size-4" />
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-[auto_1fr]">
        <div className="flex gap-1">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => pickCountry(c.code)}
              className={cn(
                "flex h-12 items-center gap-2 rounded-xl border px-4 font-semibold",
                country === c.code ? "border-volt bg-volt/10 text-volt" : "border-line-strong bg-ink/60 text-muted-foreground",
              )}
            >
              <span aria-hidden>{c.flag}</span> {c.code === "IN" ? "India" : "USA"}
            </button>
          ))}
        </div>
        {scope === "state" && (
          <select value={stateCode} onChange={(e) => setStateCode(e.target.value)} className={select} aria-label="State">
            {REGIONS[country].map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
        )}
        {scope === "university" && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <input
              value={uniQuery}
              onChange={(e) => setUniQuery(e.target.value)}
              placeholder={uni ? uni.name : "Search universities…"}
              className={cn(select, "pl-9")}
              aria-label="Search universities"
            />
            {uniQuery && (
              <ul className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-xl border border-line-strong bg-night p-1 shadow-2xl">
                {uniResults.map((u) => (
                  <li key={u.id}>
                    <button
                      onClick={() => {
                        setUni(u);
                        setUniQuery("");
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-deck"
                    >
                      {u.name}
                    </button>
                  </li>
                ))}
                {!uniResults.length && <li className="px-3 py-2 text-sm text-faint">No matches.</li>}
              </ul>
            )}
          </div>
        )}
      </div>

      {!query ? (
        <div className="panel mt-6 p-10 text-center text-muted-foreground">Pick a university to see its board.</div>
      ) : error ? (
        <div className="panel mt-6 p-10 text-center text-hot">{error}</div>
      ) : !board ? (
        <div className="mt-6 h-96 animate-pulse rounded-3xl bg-night/60" />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${board.scope}-${board.title}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="mt-6"
          >
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-3xl font-black uppercase">{board.title}</h2>
              <span className="text-sm text-muted-foreground">
                {board.totalPlayers.toLocaleString()} player{board.totalPlayers === 1 ? "" : "s"}
                {board.me && (
                  <>
                    {" "}
                    · you&apos;re <b className="text-volt">#{board.me.rank}</b>
                  </>
                )}
              </span>
            </div>

            {board.entries.length === 0 ? (
              <div className="panel p-10 text-center">
                <Trophy className="mx-auto size-10 text-amber" />
                <p className="mt-3 font-display text-3xl font-black uppercase">Wide open</p>
                <p className="mt-1 text-muted-foreground">Nobody has scored here yet. Play a round and take #1.</p>
              </div>
            ) : (
              <>
                <ol className="grid gap-3 sm:grid-cols-3">
                  {top3.map((e, i) => (
                    <motion.li
                      key={e.displayName + e.rank}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.08 * i, type: "spring", stiffness: 260, damping: 20 }}
                      className={cn(
                        "panel relative overflow-hidden p-5 text-center",
                        e.rank === 1 && "border-amber/60 shadow-[0_0_50px_rgb(255_190_46/0.25)]",
                        e.isMe && "ring-2 ring-volt",
                      )}
                    >
                      {e.rank === 1 && <Crown className="mx-auto size-8 text-amber" />}
                      <p className={cn("font-display text-5xl font-black", e.rank === 1 ? "text-amber" : e.rank === 2 ? "text-cyan" : "text-uv-soft")}>
                        #{e.rank}
                      </p>
                      <p className="mt-1 truncate font-display text-2xl font-extrabold uppercase">{e.displayName}</p>
                      <p className="truncate text-xs text-muted-foreground" title={e.universityName}>
                        {board.scope === "university" ? e.stateName : e.universityName}
                      </p>
                      <p className="mt-2 font-display text-4xl font-black tabular text-volt">{e.totalPoints.toLocaleString()}</p>
                    </motion.li>
                  ))}
                </ol>
                {rest.length > 0 && (
                  <ol className="panel mt-3 divide-y divide-line overflow-hidden">
                    {rest.map((e, i) => (
                      <motion.li
                        key={e.displayName + e.rank}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(0.02 * i, 0.4) }}
                        className={cn("flex items-center gap-4 px-4 py-3", e.isMe && "bg-volt/10")}
                      >
                        <span className="w-10 shrink-0 font-display text-2xl font-black tabular text-muted-foreground">{e.rank}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">
                            {e.displayName} {e.isMe && <span className="text-xs font-bold uppercase text-volt">· you</span>}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {board.scope === "university" ? e.stateName : e.universityName} · {e.roundsPlayed} rounds
                          </p>
                        </div>
                        <span className="font-display text-2xl font-black tabular text-volt">{e.totalPoints.toLocaleString()}</span>
                      </motion.li>
                    ))}
                  </ol>
                )}
                {board.me && !meVisible && (
                  <div className="panel mt-3 flex items-center gap-4 border-volt/50 bg-volt/10 px-4 py-3">
                    <span className="font-display text-2xl font-black tabular text-volt">#{board.me.rank}</span>
                    <span className="flex-1 font-semibold">You</span>
                    <span className="font-display text-2xl font-black tabular text-volt">{board.me.totalPoints.toLocaleString()}</span>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}

export default function LeaderboardsPage() {
  return (
    <main className="relative min-h-dvh">
      <Backdrop tone="default" />
      <header className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo size="sm" />
        <nav className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
          <Link href="/how-to-play" className="rounded-lg px-3 py-2 hover:text-text">
            How to play
          </Link>
          <Link href="/create" className="rounded-lg px-3 py-2 text-text hover:text-volt">
            Host
          </Link>
        </nav>
      </header>
      <div className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-night/60" />}>
          <Boards />
        </Suspense>
      </div>
    </main>
  );
}
