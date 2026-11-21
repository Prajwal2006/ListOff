"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { AnalyticsReport } from "@/server/analytics.service";
import { cn } from "@/lib/utils";
import { adminFetch } from "./admin-fetch";

const RANGES = [7, 30, 90] as const;
type SeriesKey = "views" | "visitors" | "games" | "soloRounds" | "signups";
const SERIES: { key: SeriesKey; label: string }[] = [
  { key: "views", label: "Page views" },
  { key: "visitors", label: "Visitors" },
  { key: "games", label: "Multiplayer games" },
  { key: "soloRounds", label: "Solo rounds" },
  { key: "signups", label: "New accounts" },
];

export function AnalyticsPanel({ secret }: { secret: string }) {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<AnalyticsReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [metric, setMetric] = useState<SeriesKey>("views");

  const load = useCallback(async () => {
    setBusy(true);
    try {
      setData(await adminFetch<AnalyticsReport>(secret, `/api/admin/analytics?days=${days}`));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [secret, days]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (!data) return <p className="panel p-6 text-muted-foreground">{busy ? "Crunching numbers…" : "No data yet."}</p>;
  const t = data.totals;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl border border-line bg-night/60 p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold", days === r ? "bg-uv text-white" : "text-muted-foreground hover:text-text")}
            >
              Last {r} days
            </button>
          ))}
        </div>
        <button onClick={load} disabled={busy} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-text">
          <RefreshCw className={cn("size-4", busy && "animate-spin")} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Page views" value={t.pageViews} />
        <Stat label="Unique visitors" value={t.visitors} hint="anonymous browser ids" />
        <Stat label="Multiplayer games" value={t.gamesCreated} hint={`${t.gamesFinished} finished · ${t.gamesAllTime} all-time`} />
        <Stat label="Players joined" value={t.playersJoined} hint="in multiplayer lobbies" />
        <Stat label="Solo rounds" value={t.soloRounds} hint={`${t.soloCompleted} completed`} />
        <Stat label="New accounts" value={t.signups} hint={`${t.accountsAllTime} all-time`} />
        <Stat label="Answers typed" value={t.answersSubmitted} hint={`${t.answerAcceptRate}% accepted · ${t.duplicateRate}% duplicates`} />
        <Stat label="Bid hit rate" value={`${t.soloBidHitRate}%`} hint={`solo · multiplayer ${t.mpBidHitRate}%`} />
        <Stat label="Pending appeals" value={t.appealsPending} tone={t.appealsPending ? "hot" : undefined} hint={`${t.appealsInRange} new · ${t.appealsApproved} approved ever`} />
        <Stat label="Topics" value={t.activeTopics} hint={`${t.topics} total · ${t.knowledgeAnswers.toLocaleString()} answers`} />
      </div>

      <section className="panel p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-2xl font-extrabold uppercase">Activity by day</h3>
          <div className="flex flex-wrap gap-1">
            {SERIES.map((s) => (
              <button
                key={s.key}
                onClick={() => setMetric(s.key)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold",
                  metric === s.key ? "border-uv bg-uv/15 text-uv-soft" : "border-line text-muted-foreground hover:text-text",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <BarChart points={data.series.map((d) => ({ label: d.date, value: d[metric] }))} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <RankList title="Most played topics" rows={data.popularTopics.map((r) => ({ label: r.name, sub: r.category, n: r.plays, extra: `avg ${r.avgFound} of ${r.totalAnswers}` }))} empty="No rounds played in this period." />
        <RankList title="Toughest topics" hint="lowest share of players hitting their bid (3+ plays)" rows={data.hardestTopics.map((r) => ({ label: r.name, sub: r.category, n: r.hitRate, suffix: "%", extra: `${r.plays} plays` }))} empty="Not enough plays yet." />
        <RankList title="Most-rejected answers" hint="frequent misses are candidates to add — check Appeals" rows={data.topRejected.map((r) => ({ label: r.text, sub: r.topic, n: r.count }))} empty="Nothing rejected yet." />
        <RankList title="Categories played" rows={data.categories.map((r) => ({ label: r.label, n: r.n }))} empty="No rounds played in this period." />
        <RankList title="Top pages" rows={data.topPages.map((r) => ({ label: r.label, n: r.n }))} empty="No page views recorded yet." />
        <RankList title="Devices" rows={data.devices.map((r) => ({ label: r.label, n: r.n }))} empty="No page views recorded yet." />
        <RankList title="Referrers" rows={data.referrers.map((r) => ({ label: r.label, n: r.n }))} empty="No external referrers yet." />
        <RankList title="Top universities (solo players)" rows={data.topUniversities.map((r) => ({ label: r.label, n: r.n, extra: `${r.points.toLocaleString()} pts` }))} empty="No solo players yet." />
        <RankList title="Players by country" rows={data.topCountries.map((r) => ({ label: r.label, n: r.n }))} empty="No solo players yet." />
      </div>
      <p className="text-xs text-faint">
        Page views are anonymous (random browser id, no IP). Visitors who enable Do Not Track aren&apos;t counted, so traffic is a floor. Game and
        answer numbers come straight from the database.
      </p>
    </div>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: number | string; hint?: string; tone?: "hot" }) {
  return (
    <div className="panel p-4">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-faint">{label}</p>
      <p className={cn("font-display text-4xl font-black tabular", tone === "hot" && "text-hot")}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function BarChart({ points }: { points: { label: string; value: number }[] }) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const total = points.reduce((a, p) => a + p.value, 0);
  return (
    <div>
      <div className="flex h-44 items-end gap-[3px]" role="img" aria-label={`Daily totals, ${total} in all`}>
        {points.map((p) => (
          <div key={p.label} className="group relative flex h-full flex-1 items-end" title={`${p.label}: ${p.value}`}>
            <div
              className="w-full rounded-t bg-uv/80 transition group-hover:bg-volt"
              style={{ height: `${Math.max(p.value ? 4 : 1, (p.value / max) * 100)}%`, opacity: p.value ? 1 : 0.25 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-faint">
        <span>{points[0]?.label}</span>
        <span>
          {total.toLocaleString()} total · peak {max.toLocaleString()}
        </span>
        <span>{points.at(-1)?.label}</span>
      </div>
    </div>
  );
}

function RankList({
  title,
  hint,
  rows,
  empty,
}: {
  title: string;
  hint?: string;
  rows: { label: string; sub?: string; n: number; suffix?: string; extra?: string }[];
  empty: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <section className="panel p-5">
      <h3 className="font-display text-2xl font-extrabold uppercase">{title}</h3>
      {hint && <p className="text-xs text-faint">{hint}</p>}
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((r, i) => (
            <li key={`${r.label}-${r.sub}-${i}`} className="relative overflow-hidden rounded-lg border border-line bg-night/40 px-3 py-1.5">
              <div className="absolute inset-y-0 left-0 bg-uv/15" style={{ width: `${(r.n / max) * 100}%` }} />
              <div className="relative flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-semibold">
                  {r.label}
                  {r.sub && <span className="ml-2 text-xs font-normal text-faint">{r.sub}</span>}
                </span>
                <span className="shrink-0 text-sm tabular">
                  <b>
                    {r.n.toLocaleString()}
                    {r.suffix}
                  </b>
                  {r.extra && <span className="ml-2 text-xs text-faint">{r.extra}</span>}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
