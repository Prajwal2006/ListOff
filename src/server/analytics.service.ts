import { and, count, countDistinct, desc, eq, gte, sql } from "drizzle-orm";
import type { Db, DbOrTx } from "@/lib/db/client";
import {
  analyticsEvents,
  answerAppeals,
  games,
  participantAnswers,
  participants,
  playerProfiles,
  roundScores,
  soloAnswers,
  soloRounds,
  topics,
  universities,
} from "@/lib/db/schema";

/* ───────────────────────────── Collection ───────────────────────────── */

const EVENT_NAMES = new Set(["page_view"]);
const ANON_ID = /^[a-z0-9-]{8,64}$/i;
const DEVICES = new Set(["mobile", "tablet", "desktop"]);

/** Strips ids out of dynamic routes so /game/ABCD and /game/WXYZ count as one page. */
export function cleanPath(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.startsWith("/")) return null;
  const p = raw.split(/[?#]/)[0].slice(0, 120);
  return p.replace(/^\/(game|join|dashboard)\/[^/]+/, "/$1/[code]") || "/";
}

function refHost(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    return new URL(raw).hostname.slice(0, 80) || null;
  } catch {
    return null;
  }
}

export async function recordEvent(db: DbOrTx, input: Record<string, unknown>) {
  const name = typeof input.name === "string" ? input.name : "";
  if (!EVENT_NAMES.has(name)) return;
  const anonId = typeof input.anonId === "string" && ANON_ID.test(input.anonId) ? input.anonId : null;
  const device = typeof input.device === "string" && DEVICES.has(input.device) ? input.device : null;
  await db.insert(analyticsEvents).values({
    name,
    path: cleanPath(input.path),
    anonId,
    device,
    referrer: refHost(input.referrer),
  });
}

/* ───────────────────────────── Reporting ────────────────────────────── */

const day = (col: unknown) => sql<string>`to_char(date_trunc('day', ${col}), 'YYYY-MM-DD')`;
const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 1000) / 10 : 0);

export type AnalyticsReport = Awaited<ReturnType<typeof getAnalytics>>;

export async function getAnalytics(db: Db, rawDays: number) {
  const days = [7, 30, 90].includes(rawDays) ? rawDays : 30;
  const since = new Date(Date.now() - days * 86_400_000);

  const [
    [views],
    [visitors],
    [gamesAll],
    [gamesRange],
    [gamesFinished],
    [players],
    [soloRange],
    [soloDone],
    [soloHit],
    [soloPlayersAll],
    [mpRoundsDone],
    [mpHit],
    [soloAns],
    [mpAns],
    [appealsPending],
    [appealsAll],
    [appealsApproved],
    [accounts],
    [kb],
  ] = await Promise.all([
    db.select({ n: count() }).from(analyticsEvents).where(and(eq(analyticsEvents.name, "page_view"), gte(analyticsEvents.createdAt, since))),
    db
      .select({ n: countDistinct(analyticsEvents.anonId) })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.name, "page_view"), gte(analyticsEvents.createdAt, since))),
    db.select({ n: count() }).from(games),
    db.select({ n: count() }).from(games).where(gte(games.createdAt, since)),
    db.select({ n: count() }).from(games).where(and(eq(games.currentState, "GAME_FINISHED"), gte(games.createdAt, since))),
    db.select({ n: count() }).from(participants).where(gte(participants.joinedAt, since)),
    db.select({ n: count() }).from(soloRounds).where(gte(soloRounds.createdAt, since)),
    db.select({ n: count() }).from(soloRounds).where(and(eq(soloRounds.status, "COMPLETE"), gte(soloRounds.createdAt, since))),
    db
      .select({ n: count() })
      .from(soloRounds)
      .where(and(eq(soloRounds.status, "COMPLETE"), sql`${soloRounds.points} > 0`, gte(soloRounds.createdAt, since))),
    db.select({ n: count() }).from(playerProfiles),
    db.select({ n: count() }).from(roundScores).where(gte(roundScores.createdAt, since)),
    db
      .select({ n: count() })
      .from(roundScores)
      .where(and(sql`${roundScores.pointsAwarded} > 0`, gte(roundScores.createdAt, since))),
    db
      .select({
        total: count(),
        valid: sql<number>`count(*) filter (where ${soloAnswers.isValid} and not ${soloAnswers.isDuplicate})::int`,
        dupes: sql<number>`count(*) filter (where ${soloAnswers.isDuplicate})::int`,
      })
      .from(soloAnswers)
      .where(gte(soloAnswers.submittedAt, since)),
    db
      .select({
        total: count(),
        valid: sql<number>`count(*) filter (where ${participantAnswers.isValid} and not ${participantAnswers.isDuplicate})::int`,
        dupes: sql<number>`count(*) filter (where ${participantAnswers.isDuplicate})::int`,
      })
      .from(participantAnswers)
      .where(gte(participantAnswers.submittedAt, since)),
    db.select({ n: count() }).from(answerAppeals).where(eq(answerAppeals.status, "PENDING")),
    db.select({ n: count() }).from(answerAppeals).where(gte(answerAppeals.createdAt, since)),
    db.select({ n: count() }).from(answerAppeals).where(eq(answerAppeals.status, "APPROVED")),
    db.select({ n: count() }).from(playerProfiles).where(gte(playerProfiles.createdAt, since)),
    db
      .select({
        topics: count(),
        active: sql<number>`count(*) filter (where ${topics.isActive})::int`,
        answers: sql<number>`(select count(*)::int from answers)`,
      })
      .from(topics),
  ]);

  const [viewsByDay, gamesByDay, soloByDay, accountsByDay] = await Promise.all([
    db
      .select({ d: day(analyticsEvents.createdAt), n: count(), u: countDistinct(analyticsEvents.anonId) })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.name, "page_view"), gte(analyticsEvents.createdAt, since)))
      .groupBy(day(analyticsEvents.createdAt)),
    db.select({ d: day(games.createdAt), n: count() }).from(games).where(gte(games.createdAt, since)).groupBy(day(games.createdAt)),
    db.select({ d: day(soloRounds.createdAt), n: count() }).from(soloRounds).where(gte(soloRounds.createdAt, since)).groupBy(day(soloRounds.createdAt)),
    db.select({ d: day(playerProfiles.createdAt), n: count() }).from(playerProfiles).where(gte(playerProfiles.createdAt, since)).groupBy(day(playerProfiles.createdAt)),
  ]);

  const series: { date: string; views: number; visitors: number; games: number; soloRounds: number; signups: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    const v = viewsByDay.find((r) => r.d === date);
    series.push({
      date,
      views: v?.n ?? 0,
      visitors: v?.u ?? 0,
      games: gamesByDay.find((r) => r.d === date)?.n ?? 0,
      soloRounds: soloByDay.find((r) => r.d === date)?.n ?? 0,
      signups: accountsByDay.find((r) => r.d === date)?.n ?? 0,
    });
  }

  const [topPages, devices, referrers] = await Promise.all([
    db
      .select({ label: analyticsEvents.path, n: count() })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.name, "page_view"), gte(analyticsEvents.createdAt, since)))
      .groupBy(analyticsEvents.path)
      .orderBy(desc(count()))
      .limit(10),
    db
      .select({ label: analyticsEvents.device, n: count() })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.name, "page_view"), gte(analyticsEvents.createdAt, since)))
      .groupBy(analyticsEvents.device)
      .orderBy(desc(count())),
    db
      .select({ label: analyticsEvents.referrer, n: count() })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.name, "page_view"), gte(analyticsEvents.createdAt, since), sql`${analyticsEvents.referrer} is not null`))
      .groupBy(analyticsEvents.referrer)
      .orderBy(desc(count()))
      .limit(8),
  ]);

  // Topic popularity: solo rounds + multiplayer rounds that were actually played.
  const topicRows = await db.execute(sql`
    select t.id, t.name, c.name as category,
           count(*)::int as plays,
           coalesce(avg(r.valid), 0)::float as avg_found,
           (select count(*)::int from answers a where a.topic_id = t.id and a.is_active) as total_answers,
           coalesce(avg(case when r.valid >= r.bid and r.bid is not null then 1.0 when r.bid is not null then 0.0 end), 0)::float as hit_rate
    from (
      select topic_id, valid_count as valid, predicted_count as bid
        from solo_rounds where status = 'COMPLETE' and created_at >= ${since}
      union all
      select gr.topic_id, rs.valid_answer_count, rs.predicted_count
        from round_scores rs join game_rounds gr on gr.id = rs.round_id where rs.created_at >= ${since}
    ) r
    join topics t on t.id = r.topic_id
    join categories c on c.id = t.category_id
    group by t.id, t.name, c.name
    order by plays desc, t.name
    limit 200
  `);
  const topicList = rowsOf<{
    id: number;
    name: string;
    category: string;
    plays: number;
    avg_found: number;
    total_answers: number;
    hit_rate: number;
  }>(topicRows).map((r) => ({
    id: Number(r.id),
    name: r.name,
    category: r.category,
    plays: Number(r.plays),
    avgFound: Math.round(Number(r.avg_found) * 10) / 10,
    totalAnswers: Number(r.total_answers),
    hitRate: Math.round(Number(r.hit_rate) * 1000) / 10,
  }));
  const popularTopics = topicList.slice(0, 10);
  const hardestTopics = topicList
    .filter((t) => t.plays >= 3)
    .sort((a, b) => a.hitRate - b.hitRate || b.plays - a.plays)
    .slice(0, 10);

  const categoryRows = await db.execute(sql`
    select c.name as label, count(*)::int as n
    from (
      select topic_id from solo_rounds where status = 'COMPLETE' and created_at >= ${since}
      union all
      select gr.topic_id from round_scores rs join game_rounds gr on gr.id = rs.round_id where rs.created_at >= ${since}
    ) r
    join topics t on t.id = r.topic_id
    join categories c on c.id = t.category_id
    group by c.name order by n desc limit 10
  `);

  // Most frequently rejected answers — the best source of missing answers/aliases.
  const rejectedRows = await db.execute(sql`
    select topic_id, topic, normalized, min(text) as text, sum(n)::int as n
    from (
      select sa.topic_id as topic_id, t.name as topic, a.normalized_text as normalized, min(a.submitted_text) as text, count(*) as n
        from solo_answers a join solo_rounds sa on sa.id = a.round_id join topics t on t.id = sa.topic_id
        where not a.is_valid and a.submitted_at >= ${since} group by 1, 2, 3
      union all
      select gr.topic_id, t.name, a.normalized_text, min(a.submitted_text), count(*)
        from participant_answers a join game_rounds gr on gr.id = a.round_id join topics t on t.id = gr.topic_id
        where not a.is_valid and a.submitted_at >= ${since} group by 1, 2, 3
    ) x
    group by topic_id, topic, normalized
    order by n desc limit 15
  `);
  const topRejected = rowsOf<{ topic_id: number; topic: string; text: string; n: number }>(rejectedRows).map((r) => ({
    topicId: Number(r.topic_id),
    topic: r.topic,
    text: r.text,
    count: Number(r.n),
  }));

  const [topUniversities, topCountries] = await Promise.all([
    db
      .select({ label: universities.name, n: count(), points: sql<number>`coalesce(sum(${playerProfiles.totalPoints}), 0)::int` })
      .from(playerProfiles)
      .innerJoin(universities, eq(universities.id, playerProfiles.universityId))
      .groupBy(universities.name)
      .orderBy(desc(count()))
      .limit(8),
    db.select({ label: playerProfiles.country, n: count() }).from(playerProfiles).groupBy(playerProfiles.country).orderBy(desc(count())),
  ]);

  const mpAnswers = Number(mpAns?.total ?? 0);
  const soloAnswersN = Number(soloAns?.total ?? 0);
  const totalAnswers = mpAnswers + soloAnswersN;
  const validAnswers = Number(mpAns?.valid ?? 0) + Number(soloAns?.valid ?? 0);
  const dupes = Number(mpAns?.dupes ?? 0) + Number(soloAns?.dupes ?? 0);

  return {
    days,
    generatedAt: Date.now(),
    totals: {
      pageViews: views.n,
      visitors: visitors.n,
      gamesCreated: gamesRange.n,
      gamesFinished: gamesFinished.n,
      gamesAllTime: gamesAll.n,
      playersJoined: players.n,
      soloRounds: soloRange.n,
      soloCompleted: soloDone.n,
      soloBidHitRate: pct(soloHit.n, soloDone.n),
      mpBidHitRate: pct(mpHit.n, mpRoundsDone.n),
      answersSubmitted: totalAnswers,
      answerAcceptRate: pct(validAnswers, totalAnswers),
      duplicateRate: pct(dupes, totalAnswers),
      signups: accounts.n,
      accountsAllTime: soloPlayersAll.n,
      appealsPending: appealsPending.n,
      appealsInRange: appealsAll.n,
      appealsApproved: appealsApproved.n,
      topics: kb.topics,
      activeTopics: kb.active,
      knowledgeAnswers: kb.answers,
    },
    series,
    topPages: topPages.map((r) => ({ label: r.label ?? "(unknown)", n: r.n })),
    devices: devices.map((r) => ({ label: r.label ?? "unknown", n: r.n })),
    referrers: referrers.map((r) => ({ label: r.label ?? "", n: r.n })),
    popularTopics,
    hardestTopics,
    categories: rowsOf<{ label: string; n: number }>(categoryRows).map((r) => ({ label: r.label, n: Number(r.n) })),
    topRejected,
    topUniversities,
    topCountries,
  };
}

/** drizzle's `execute` returns `{ rows }` on PGlite and a plain array on postgres-js. */
function rowsOf<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  return ((res as { rows?: T[] })?.rows ?? []) as T[];
}
