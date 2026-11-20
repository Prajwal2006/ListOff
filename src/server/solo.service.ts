import { and, asc, count, desc, eq, gt, ilike, inArray, lt, or, sql } from "drizzle-orm";
import type { Db, DbOrTx } from "@/lib/db/client";
import { answers, playerProfiles, soloAnswers, soloRounds, universities, type SoloRound } from "@/lib/db/schema";
import { isCountry, isRegion, regionName, type CountryCode } from "@/data/regions";
import { calculatePoints, isValidPrediction, MAX_PREDICTION, MIN_PREDICTION } from "@/lib/scoring";
import { MAX_ANSWER_LENGTH, normalizeAnswer, universityKey } from "@/lib/validation/normalize";
import { clock } from "@/lib/utils/clock";
import { MAX_ANSWERS_PER_ROUND, SUBMIT_GRACE_MS } from "@/lib/game-engine/state-machine";
import { loadAnswerLexicon, loadTopicIndex } from "./answer-validation.service";
import { fail } from "./errors";
import { sanitizeDisplayName } from "./participant.service";
import { topicCandidates } from "./round.service";
import { getPublicTopic } from "./snapshot.service";
import type {
  LeaderboardResponse,
  LeaderboardScope,
  SoloAnswerResponse,
  SoloProfileView,
  SoloRoundView,
  UniversityView,
} from "@/types/solo";

/** Every solo round is the same length, so leaderboard totals are comparable. */
export const SOLO_ROUND_SECONDS = 30;
/** "3-2-1" between locking the bid and the clock starting. */
export const SOLO_COUNTDOWN_MS = 3000;
/** Topics a player has seen recently aren't dealt again. */
const RECENT_TOPICS = 40;
/** How many universities a single player may add to the list. */
const MAX_CUSTOM_UNIVERSITIES = 3;
const LEADERBOARD_SIZE = 50;

/* ───────────────────────────── Universities ───────────────────────────── */

function universityView(u: typeof universities.$inferSelect): UniversityView {
  return { id: u.id, name: u.name, country: u.country as CountryCode, stateCode: u.stateCode, isCustom: u.isCustom };
}

export async function searchUniversities(
  db: DbOrTx,
  opts: { country: unknown; state?: unknown; q?: unknown },
): Promise<UniversityView[]> {
  if (!isCountry(opts.country)) fail("BAD_REQUEST", "Pick India or the United States.");
  const country = opts.country as CountryCode;
  const q = typeof opts.q === "string" ? opts.q.trim().slice(0, 80) : "";
  const conds = [eq(universities.country, country)];
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    conds.push(or(ilike(universities.name, like), eq(universities.nameKey, universityKey(q)))!);
  }
  const rows = await db
    .select()
    .from(universities)
    .where(and(...conds))
    .orderBy(
      // Same-state institutions first, then the curated list before player-added ones.
      typeof opts.state === "string" ? sql`(${universities.stateCode} = ${opts.state}) DESC` : sql`1`,
      asc(universities.isCustom),
      asc(universities.name),
    )
    .limit(q ? 30 : 60);
  return rows.map(universityView);
}

export async function addUniversity(
  db: Db,
  userId: string,
  input: { name?: unknown; country?: unknown; stateCode?: unknown },
): Promise<UniversityView> {
  if (!isCountry(input.country)) fail("BAD_REQUEST", "Pick India or the United States.");
  const country = input.country as CountryCode;
  if (!isRegion(country, input.stateCode)) fail("BAD_REQUEST", "Pick the state the university is in.");
  const name = typeof input.name === "string" ? input.name.replace(/\s+/g, " ").trim() : "";
  if (name.length < 4 || name.length > 120) fail("BAD_REQUEST", "University names should be 4–120 characters.");
  if (!/[a-z]{3}/i.test(name)) fail("BAD_REQUEST", "That doesn't look like a university name.");
  const nameKey = universityKey(name);

  // Already listed (curated or added by someone else)? Use that row instead of a duplicate.
  const [existing] = await db
    .select()
    .from(universities)
    .where(and(eq(universities.country, country), eq(universities.nameKey, nameKey)))
    .limit(1);
  if (existing) return universityView(existing);

  const [{ n }] = await db.select({ n: count() }).from(universities).where(eq(universities.createdBy, userId));
  if (n >= MAX_CUSTOM_UNIVERSITIES) fail("LIMIT_REACHED", `You can add up to ${MAX_CUSTOM_UNIVERSITIES} universities.`);

  const [row] = await db
    .insert(universities)
    .values({ name, nameKey, country, stateCode: input.stateCode as string, isCustom: true, createdBy: userId })
    .onConflictDoNothing()
    .returning();
  if (row) return universityView(row);
  const [raced] = await db
    .select()
    .from(universities)
    .where(and(eq(universities.country, country), eq(universities.nameKey, nameKey)))
    .limit(1);
  return universityView(raced);
}

/* ──────────────────────────────── Profiles ─────────────────────────────── */

export async function getProfile(db: DbOrTx, userId: string): Promise<SoloProfileView | null> {
  const [row] = await db
    .select({ p: playerProfiles, u: universities })
    .from(playerProfiles)
    .innerJoin(universities, eq(universities.id, playerProfiles.universityId))
    .where(eq(playerProfiles.userId, userId))
    .limit(1);
  if (!row) return null;
  const { p, u } = row;
  const ranks = await ranksFor(db, p);
  return {
    displayName: p.displayName,
    country: p.country as CountryCode,
    stateCode: p.stateCode,
    stateName: regionName(p.country, p.stateCode),
    university: universityView(u),
    totalPoints: p.totalPoints,
    roundsPlayed: p.roundsPlayed,
    bidsHit: p.bidsHit,
    bestRound: p.bestRound,
    ranks,
  };
}

export async function saveProfile(
  db: Db,
  userId: string,
  input: { displayName?: unknown; country?: unknown; stateCode?: unknown; universityId?: unknown },
): Promise<SoloProfileView> {
  const displayName = sanitizeDisplayName(input.displayName);
  if (!isCountry(input.country)) fail("BAD_REQUEST", "Pick India or the United States.");
  const country = input.country as CountryCode;
  if (!isRegion(country, input.stateCode)) fail("BAD_REQUEST", "Pick your state.");
  const universityId = Number(input.universityId);
  if (!Number.isInteger(universityId)) fail("BAD_REQUEST", "Pick your university.");
  const [uni] = await db.select().from(universities).where(eq(universities.id, universityId)).limit(1);
  if (!uni) fail("BAD_REQUEST", "That university isn't on the list.");
  if (uni.country !== country) fail("BAD_REQUEST", "Pick a university in the same country.");

  const values = { displayName, country, stateCode: input.stateCode as string, universityId, updatedAt: clock.date() };
  await db
    .insert(playerProfiles)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: playerProfiles.userId, set: values });
  return (await getProfile(db, userId))!;
}

/* ─────────────────────────────── Leaderboards ───────────────────────────── */

type ProfileRow = typeof playerProfiles.$inferSelect;

/** Standard competition rank: 1 + players strictly ahead (more points, or same points reached earlier). */
async function rankWithin(db: DbOrTx, p: ProfileRow, scope: ReturnType<typeof scopeFilter>) {
  const [{ n }] = await db
    .select({ n: count() })
    .from(playerProfiles)
    .where(
      and(
        scope,
        gt(playerProfiles.roundsPlayed, 0),
        or(
          gt(playerProfiles.totalPoints, p.totalPoints),
          and(eq(playerProfiles.totalPoints, p.totalPoints), lt(playerProfiles.pointsAt, p.pointsAt)),
        ),
      ),
    );
  return n + 1;
}

function scopeFilter(scope: LeaderboardScope, f: { country: string; stateCode?: string; universityId?: number }) {
  if (scope === "university") return eq(playerProfiles.universityId, f.universityId!);
  if (scope === "state") return and(eq(playerProfiles.country, f.country), eq(playerProfiles.stateCode, f.stateCode!))!;
  return eq(playerProfiles.country, f.country);
}

async function ranksFor(db: DbOrTx, p: ProfileRow) {
  if (p.roundsPlayed === 0) return { national: null, state: null, university: null };
  const [national, state, university] = await Promise.all([
    rankWithin(db, p, scopeFilter("national", p)),
    rankWithin(db, p, scopeFilter("state", p)),
    rankWithin(db, p, scopeFilter("university", p)),
  ]);
  return { national, state, university };
}

export async function getLeaderboard(
  db: DbOrTx,
  params: { scope?: unknown; country?: unknown; state?: unknown; university?: unknown },
  viewerId: string | null,
): Promise<LeaderboardResponse> {
  const scope: LeaderboardScope =
    params.scope === "state" || params.scope === "university" ? params.scope : "national";
  if (!isCountry(params.country)) fail("BAD_REQUEST", "Pick India or the United States.");
  const country = params.country as CountryCode;
  let stateCode: string | undefined;
  let universityId: number | undefined;
  let title = country === "IN" ? "India" : "United States";
  if (scope === "state") {
    if (!isRegion(country, params.state)) fail("BAD_REQUEST", "Pick a state.");
    stateCode = params.state as string;
    title = regionName(country, stateCode);
  }
  if (scope === "university") {
    universityId = Number(params.university);
    const [u] = Number.isInteger(universityId)
      ? await db.select().from(universities).where(eq(universities.id, universityId)).limit(1)
      : [];
    if (!u) fail("BAD_REQUEST", "Pick a university.");
    title = u.name;
  }
  const filter = scopeFilter(scope, { country, stateCode, universityId });

  const rows = await db
    .select({
      userId: playerProfiles.userId,
      displayName: playerProfiles.displayName,
      stateCode: playerProfiles.stateCode,
      country: playerProfiles.country,
      universityName: universities.name,
      totalPoints: playerProfiles.totalPoints,
      roundsPlayed: playerProfiles.roundsPlayed,
      bidsHit: playerProfiles.bidsHit,
      rank: sql<number>`rank() OVER (ORDER BY ${playerProfiles.totalPoints} DESC, ${playerProfiles.pointsAt} ASC)`,
    })
    .from(playerProfiles)
    .innerJoin(universities, eq(universities.id, playerProfiles.universityId))
    .where(and(filter, gt(playerProfiles.roundsPlayed, 0)))
    .orderBy(desc(playerProfiles.totalPoints), asc(playerProfiles.pointsAt))
    .limit(LEADERBOARD_SIZE);

  const [{ total }] = await db
    .select({ total: count() })
    .from(playerProfiles)
    .where(and(filter, gt(playerProfiles.roundsPlayed, 0)));

  let me: LeaderboardResponse["me"] = null;
  if (viewerId) {
    const [p] = await db.select().from(playerProfiles).where(and(eq(playerProfiles.userId, viewerId), filter)).limit(1);
    if (p && p.roundsPlayed > 0) me = { rank: await rankWithin(db, p, filter), totalPoints: p.totalPoints };
  }

  return {
    scope,
    title,
    totalPlayers: total,
    entries: rows.map((r) => ({
      rank: Number(r.rank),
      displayName: r.displayName,
      universityName: r.universityName,
      stateName: regionName(r.country, r.stateCode),
      totalPoints: r.totalPoints,
      roundsPlayed: r.roundsPlayed,
      bidsHit: r.bidsHit,
      isMe: r.userId === viewerId,
    })),
    me,
  };
}

/* ───────────────────────────────── Rounds ──────────────────────────────── */

async function requireProfile(db: DbOrTx, userId: string) {
  const [p] = await db.select().from(playerProfiles).where(eq(playerProfiles.userId, userId)).limit(1);
  if (!p) fail("FORBIDDEN", "Set up your player profile first.");
  return p!;
}

async function loadOwnRound(db: DbOrTx, userId: string, roundId: unknown): Promise<SoloRound> {
  if (typeof roundId !== "string" || !/^[0-9a-f-]{36}$/i.test(roundId)) fail("NOT_FOUND", "Round not found.");
  const [r] = await db
    .select()
    .from(soloRounds)
    .where(and(eq(soloRounds.id, roundId as string), eq(soloRounds.userId, userId)))
    .limit(1);
  if (!r) fail("NOT_FOUND", "Round not found.");
  return r!;
}

/**
 * Scores a finished round exactly once: the ANSWERING → COMPLETE transition is a conditional
 * update, and the profile total is bumped in the same transaction.
 */
async function finalizeIfDue(db: Db, round: SoloRound): Promise<SoloRound> {
  if (round.status !== "ANSWERING" || !round.answeringDeadline) return round;
  if (clock.now() <= round.answeringDeadline.getTime() + SUBMIT_GRACE_MS) return round;

  await db.transaction(async (tx) => {
    const [claimed] = await tx
      .update(soloRounds)
      .set({ status: "COMPLETE", completedAt: clock.date() })
      .where(and(eq(soloRounds.id, round.id), eq(soloRounds.status, "ANSWERING")))
      .returning();
    if (!claimed) return; // someone else scored it
    const [{ valid }] = await tx
      .select({ valid: count() })
      .from(soloAnswers)
      .where(and(eq(soloAnswers.roundId, round.id), eq(soloAnswers.isValid, true), eq(soloAnswers.isDuplicate, false)));
    const points = calculatePoints(valid, claimed.predictedCount);
    await tx.update(soloRounds).set({ validCount: valid, points }).where(eq(soloRounds.id, round.id));
    await tx
      .update(playerProfiles)
      .set({
        totalPoints: sql`${playerProfiles.totalPoints} + ${points}`,
        roundsPlayed: sql`${playerProfiles.roundsPlayed} + 1`,
        bidsHit: sql`${playerProfiles.bidsHit} + ${points > 0 ? 1 : 0}`,
        bestRound: sql`GREATEST(${playerProfiles.bestRound}, ${points})`,
        ...(points > 0 ? { pointsAt: clock.date() } : {}),
        updatedAt: clock.date(),
      })
      .where(eq(playerProfiles.userId, claimed.userId));
  });
  const [fresh] = await db.select().from(soloRounds).where(eq(soloRounds.id, round.id)).limit(1);
  return fresh;
}

async function pickSoloTopic(db: DbOrTx, userId: string): Promise<number> {
  const recent = await db
    .select({ topicId: soloRounds.topicId })
    .from(soloRounds)
    .where(eq(soloRounds.userId, userId))
    .orderBy(desc(soloRounds.createdAt))
    .limit(RECENT_TOPICS);
  const seen = new Set(recent.map((r) => r.topicId));
  const all = await topicCandidates(db);
  if (!all.length) fail("CONFLICT", "No topics are available right now.");
  const fresh = all.filter((t) => !seen.has(t.id));
  const pool = fresh.length ? fresh : all;
  return pool[Math.floor(Math.random() * pool.length)].id;
}

/**
 * Starts a round, or resumes the one already open. An open round can't be swapped for a new
 * topic here — use skipRound — so the database is the only place a round's topic comes from.
 */
export async function startSoloRound(db: Db, userId: string): Promise<SoloRoundView> {
  await requireProfile(db, userId);
  const open = await db
    .select()
    .from(soloRounds)
    .where(and(eq(soloRounds.userId, userId), inArray(soloRounds.status, ["PREDICTION", "ANSWERING"])))
    .limit(1);
  if (open[0]) {
    const r = await finalizeIfDue(db, open[0]);
    if (r.status === "PREDICTION" || r.status === "ANSWERING") return roundView(db, r);
  }
  const topicId = await pickSoloTopic(db, userId);
  const [row] = await db
    .insert(soloRounds)
    .values({ userId, topicId, roundDuration: SOLO_ROUND_SECONDS })
    .onConflictDoNothing()
    .returning();
  if (!row) {
    // A parallel request opened one first; return that.
    const [r] = await db
      .select()
      .from(soloRounds)
      .where(and(eq(soloRounds.userId, userId), inArray(soloRounds.status, ["PREDICTION", "ANSWERING"])))
      .limit(1);
    return roundView(db, r);
  }
  return roundView(db, row);
}

/** Drops an unbid round (no points, doesn't count as played). */
export async function skipSoloRound(db: Db, userId: string, roundId: unknown): Promise<void> {
  const r = await loadOwnRound(db, userId, roundId);
  if (r.status !== "PREDICTION") fail("WRONG_PHASE", "You've already bid on this round.");
  await db
    .update(soloRounds)
    .set({ status: "ABANDONED", completedAt: clock.date() })
    .where(and(eq(soloRounds.id, r.id), eq(soloRounds.status, "PREDICTION")));
}

export async function placeSoloBid(db: Db, userId: string, roundId: unknown, raw: unknown): Promise<SoloRoundView> {
  if (!isValidPrediction(raw)) fail("BAD_REQUEST", `Bid a whole number from ${MIN_PREDICTION} to ${MAX_PREDICTION}.`);
  const r = await loadOwnRound(db, userId, roundId);
  const startsAt = clock.now() + SOLO_COUNTDOWN_MS;
  const [moved] = await db
    .update(soloRounds)
    .set({
      status: "ANSWERING",
      predictedCount: raw as number,
      answeringStartsAt: new Date(startsAt),
      answeringDeadline: new Date(startsAt + r.roundDuration * 1000),
    })
    .where(and(eq(soloRounds.id, r.id), eq(soloRounds.status, "PREDICTION")))
    .returning();
  if (!moved) fail("WRONG_PHASE", "Your bid is already locked.");
  return roundView(db, moved);
}

export async function submitSoloAnswer(
  db: Db,
  userId: string,
  roundId: unknown,
  rawText: unknown,
): Promise<SoloAnswerResponse> {
  if (typeof rawText !== "string") fail("BAD_REQUEST", "Type an answer first.");
  const text = (rawText as string).replace(/\s+/g, " ").trim();
  if (!text) fail("BAD_REQUEST", "Type an answer first.");
  if (text.length > MAX_ANSWER_LENGTH) fail("BAD_REQUEST", `Answers can be up to ${MAX_ANSWER_LENGTH} characters.`);
  const normalized = normalizeAnswer(text);
  if (!normalized) fail("BAD_REQUEST", "That answer has no letters or numbers in it.");

  return db.transaction(async (tx) => {
    // Locks the round against the scorer, so an answer either lands before scoring or is rejected.
    const [r] = await tx
      .select()
      .from(soloRounds)
      .where(and(eq(soloRounds.id, String(roundId)), eq(soloRounds.userId, userId)))
      .for("share")
      .limit(1);
    if (!r) fail("NOT_FOUND", "Round not found.");
    if (r.status !== "ANSWERING" || !r.answeringStartsAt || !r.answeringDeadline) fail("WRONG_PHASE", "Answering isn't open.");
    const now = clock.now();
    if (now < r.answeringStartsAt!.getTime() - 250) fail("DEADLINE_PASSED", "Hold on — the clock hasn't started.");
    if (now > r.answeringDeadline!.getTime() + SUBMIT_GRACE_MS) fail("DEADLINE_PASSED", "Time's up — answers are locked.");

    const [{ n }] = await tx.select({ n: count() }).from(soloAnswers).where(eq(soloAnswers.roundId, r.id));
    if (n >= MAX_ANSWERS_PER_ROUND) fail("LIMIT_REACHED", `That's the limit of ${MAX_ANSWERS_PER_ROUND} answers for a round.`);

    const index = await loadTopicIndex(tx, r.topicId);
    let match = index.match(text, { autocorrect: false });
    if (match.answerId === null) {
      const lexicon = await loadAnswerLexicon(tx);
      match = index.match(text, { isKnownAnswer: (k) => lexicon.has(k) });
    }
    const isValid = match.answerId !== null;
    const base = {
      roundId: r.id,
      answerId: match.answerId,
      submittedText: text,
      normalizedText: normalized,
      isValid,
      submittedAt: clock.date(),
    };

    const [sameText] = await tx
      .select({ id: soloAnswers.id })
      .from(soloAnswers)
      .where(and(eq(soloAnswers.roundId, r.id), eq(soloAnswers.normalizedText, normalized)))
      .limit(1);
    let isDuplicate = !!sameText;
    if (!sameText) {
      const [row] = await tx.insert(soloAnswers).values({ ...base, isDuplicate: false }).onConflictDoNothing().returning();
      if (!row) {
        isDuplicate = true; // same answer through a different spelling
        await tx.insert(soloAnswers).values({ ...base, isDuplicate: true });
      }
    }

    const [{ valid }] = await tx
      .select({ valid: count() })
      .from(soloAnswers)
      .where(and(eq(soloAnswers.roundId, r.id), eq(soloAnswers.isValid, true), eq(soloAnswers.isDuplicate, false)));

    return {
      submittedAnswer: text,
      canonicalAnswer: match.canonical,
      isValid,
      isDuplicate,
      corrected: match.method === "typo" || match.method === "sound" || match.method === "partial",
      validCount: valid,
    };
  });
}

export async function getSoloRound(db: Db, userId: string, roundId: unknown): Promise<SoloRoundView> {
  const r = await finalizeIfDue(db, await loadOwnRound(db, userId, roundId));
  return roundView(db, r);
}

async function roundView(db: Db, r: SoloRound): Promise<SoloRoundView> {
  const topic = await getPublicTopic(db, r.topicId);
  const done = r.status === "COMPLETE";
  const submitted =
    r.status === "PREDICTION"
      ? []
      : await db
          .select({
            text: soloAnswers.submittedText,
            answerId: soloAnswers.answerId,
            isValid: soloAnswers.isValid,
            isDuplicate: soloAnswers.isDuplicate,
            canonical: answers.canonicalAnswer,
          })
          .from(soloAnswers)
          .leftJoin(answers, eq(answers.id, soloAnswers.answerId))
          .where(eq(soloAnswers.roundId, r.id))
          .orderBy(asc(soloAnswers.id));
  let answerKey: SoloRoundView["answerKey"] = null;
  if (done) {
    const named = new Set(submitted.filter((s) => s.isValid && !s.isDuplicate).map((s) => s.answerId));
    const all = await db
      .select({ id: answers.id, canonical: answers.canonicalAnswer })
      .from(answers)
      .where(and(eq(answers.topicId, r.topicId), eq(answers.isActive, true)))
      .orderBy(asc(answers.canonicalAnswer));
    answerKey = all.map((a) => ({ answer: a.canonical, named: named.has(a.id) }));
  }
  return {
    id: r.id,
    status: r.status,
    topic,
    predictedCount: r.predictedCount,
    roundDuration: r.roundDuration,
    answeringStartsAt: r.answeringStartsAt?.getTime() ?? null,
    answeringDeadline: r.answeringDeadline?.getTime() ?? null,
    serverNow: clock.now(),
    answers: submitted.map((s) => ({
      text: s.text,
      canonical: s.canonical,
      isValid: s.isValid,
      isDuplicate: s.isDuplicate,
    })),
    validCount: r.validCount ?? submitted.filter((s) => s.isValid && !s.isDuplicate).length,
    points: r.points,
    answerKey,
  };
}
