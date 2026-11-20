import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { playerProfiles, soloRounds, universities } from "@/lib/db/schema";
import { clock } from "@/lib/utils/clock";
import { universityKey } from "@/lib/validation/normalize";
import {
  addUniversity,
  getLeaderboard,
  getProfile,
  getSoloRound,
  placeSoloBid,
  saveProfile,
  searchUniversities,
  skipSoloRound,
  SOLO_COUNTDOWN_MS,
  SOLO_ROUND_SECONDS,
  startSoloRound,
  submitSoloAnswer,
} from "@/server/solo.service";
import { getPublicTopic } from "@/server/snapshot.service";
import { fakeClock, makeTestDb } from "./helpers";

let db: Db;
const t = fakeClock();
let iitb: number;
let stanford: number;
let iitd: number;

const ANSWERS: Record<string, string[]> = {
  Fruits: ["Apple", "Banana", "Mango", "Orange", "Grape", "Watermelon", "Kiwi"],
  Vegetables: ["Carrot", "Potato", "Onion", "Garlic", "Broccoli", "Cabbage", "Spinach"],
  "US cities": ["Chicago", "Houston", "Phoenix", "Boston", "Seattle", "Denver", "Miami"],
  Colors: ["Red", "Yellow", "Green", "Blue", "Purple", "Pink", "Brown"],
};

beforeAll(async () => {
  db = await makeTestDb();
  const rows = await db
    .insert(universities)
    .values([
      { name: "IIT Bombay", nameKey: universityKey("IIT Bombay"), country: "IN", stateCode: "MH" },
      { name: "IIT Delhi", nameKey: universityKey("IIT Delhi"), country: "IN", stateCode: "DL" },
      { name: "Stanford University", nameKey: universityKey("Stanford University"), country: "US", stateCode: "CA" },
    ])
    .returning();
  [iitb, iitd, stanford] = rows.map((r) => r.id);
});
afterAll(() => clock.reset());

async function player(name: string, stateCode: string, universityId: number, country = "IN") {
  const id = randomUUID();
  await saveProfile(db, id, { displayName: name, country, stateCode, universityId });
  return id;
}

/** Plays one round: bid, name `valid` correct answers, run out the clock, read the score. */
async function playRound(userId: string, bid: number, valid: number) {
  const r = await startSoloRound(db, userId);
  await placeSoloBid(db, userId, r.id, bid);
  t.advance(SOLO_COUNTDOWN_MS);
  const words = ANSWERS[r.topic.name];
  for (const w of words.slice(0, valid)) await submitSoloAnswer(db, userId, r.id, w);
  t.advance(SOLO_ROUND_SECONDS * 1000 + 2000);
  return getSoloRound(db, userId, r.id);
}

describe("profiles", () => {
  it("requires a valid country, state and a university in that country", async () => {
    const id = randomUUID();
    await expect(saveProfile(db, id, { displayName: "X", country: "FR", stateCode: "MH", universityId: iitb })).rejects.toThrow();
    await expect(saveProfile(db, id, { displayName: "X", country: "IN", stateCode: "CA", universityId: iitb })).rejects.toThrow();
    await expect(saveProfile(db, id, { displayName: "X", country: "IN", stateCode: "MH", universityId: stanford })).rejects.toThrow();
    const p = await saveProfile(db, id, { displayName: "Asha", country: "IN", stateCode: "MH", universityId: iitb });
    expect(p.stateName).toBe("Maharashtra");
    expect(p.university.name).toBe("IIT Bombay");
    expect(p.ranks.national).toBeNull(); // no rounds yet
  });

  it("can't play without a profile", async () => {
    await expect(startSoloRound(db, randomUUID())).rejects.toThrow(/profile/);
  });
});

describe("universities", () => {
  it("searches by name and puts the player's state first", async () => {
    const res = await searchUniversities(db, { country: "IN", state: "DL" });
    expect(res[0].name).toBe("IIT Delhi");
    expect((await searchUniversities(db, { country: "US", q: "stanf" }))[0].name).toBe("Stanford University");
  });

  it("lets players add a missing university without duplicates, and caps additions", async () => {
    const user = randomUUID();
    const a = await addUniversity(db, user, { name: "Fergusson College", country: "IN", stateCode: "MH" });
    expect(a.isCustom).toBe(true);
    const again = await addUniversity(db, randomUUID(), { name: "  fergusson   COLLEGE ", country: "IN", stateCode: "MH" });
    expect(again.id).toBe(a.id);
    const listed = await addUniversity(db, user, { name: "iit bombay", country: "IN", stateCode: "MH" });
    expect(listed.id).toBe(iitb); // matched the curated entry
    await addUniversity(db, user, { name: "College Two", country: "IN", stateCode: "MH" });
    await addUniversity(db, user, { name: "College Three", country: "IN", stateCode: "MH" });
    await expect(addUniversity(db, user, { name: "College Four", country: "IN", stateCode: "MH" })).rejects.toThrow(/up to 3/);
    await expect(addUniversity(db, user, { name: "Bad", country: "IN", stateCode: "ZZ" })).rejects.toThrow();
  });
});

describe("solo rounds", () => {
  it("shows the topic before the bid and scores 2 per answer up to the bid + 1 per extra", async () => {
    const u = await player("Ravi", "MH", iitb);
    const first = await startSoloRound(db, u);
    expect(first.status).toBe("PREDICTION");
    expect(first.topic.name).toBeTruthy();
    expect(first.answerKey).toBeNull();
    await skipSoloRound(db, u, first.id);

    const hit = await playRound(u, 3, 5);
    expect(hit.status).toBe("COMPLETE");
    expect(hit.points).toBe(8);
    expect(hit.answerKey?.filter((a) => a.named)).toHaveLength(5);

    const bust = await playRound(u, 6, 5);
    expect(bust.points).toBe(0);

    const p = (await getProfile(db, u))!;
    expect(p.totalPoints).toBe(8);
    expect(p.roundsPlayed).toBe(2); // the skipped round doesn't count
    expect(p.bidsHit).toBe(1);
    expect(p.bestRound).toBe(8);
  });

  it("resumes the open round instead of dealing a new topic", async () => {
    const u = await player("Mira", "DL", iitd);
    const a = await startSoloRound(db, u);
    const b = await startSoloRound(db, u);
    expect(b.id).toBe(a.id);
    expect(b.topic.id).toBe(a.topic.id);
  });

  it("enforces the clock, one bid, duplicates and ownership", async () => {
    const u = await player("Zed", "MH", iitb);
    const r = await startSoloRound(db, u);
    await expect(submitSoloAnswer(db, u, r.id, "Apple")).rejects.toThrow(/Answering isn't open/);
    await placeSoloBid(db, u, r.id, 2);
    await expect(placeSoloBid(db, u, r.id, 9)).rejects.toThrow(/already locked/);
    await expect(submitSoloAnswer(db, u, r.id, ANSWERS[r.topic.name][0])).rejects.toThrow(/clock hasn't started/);
    t.advance(SOLO_COUNTDOWN_MS);

    const [w1, w2] = ANSWERS[r.topic.name];
    expect((await submitSoloAnswer(db, u, r.id, w1)).isValid).toBe(true);
    const dup = await submitSoloAnswer(db, u, r.id, w1.toUpperCase());
    expect(dup.isDuplicate).toBe(true);
    expect(dup.validCount).toBe(1);

    // Someone else can't read or play this round.
    const other = await player("Eve", "MH", iitb);
    await expect(getSoloRound(db, other, r.id)).rejects.toThrow(/not found/);
    await expect(submitSoloAnswer(db, other, r.id, w2)).rejects.toThrow(/not found/);

    t.advance(SOLO_ROUND_SECONDS * 1000 + 2000);
    await expect(submitSoloAnswer(db, u, r.id, w2)).rejects.toThrow(/Time's up/);
    const done = await getSoloRound(db, u, r.id);
    expect(done.points).toBe(0); // bid 2, got 1
  });

  it("scores a round exactly once even if read concurrently", async () => {
    const u = await player("Once", "KA", iitb);
    const r = await startSoloRound(db, u);
    await placeSoloBid(db, u, r.id, 1);
    t.advance(SOLO_COUNTDOWN_MS);
    await submitSoloAnswer(db, u, r.id, ANSWERS[r.topic.name][0]);
    t.advance(SOLO_ROUND_SECONDS * 1000 + 2000);
    await Promise.all([getSoloRound(db, u, r.id), getSoloRound(db, u, r.id), getSoloRound(db, u, r.id)]);
    const [p] = await db.select().from(playerProfiles).where(eq(playerProfiles.userId, u));
    expect(p.totalPoints).toBe(2);
    expect(p.roundsPlayed).toBe(1);
  });

  it("doesn't deal a topic the player saw recently while others remain", async () => {
    const u = await player("Fresh", "MH", iitb);
    const seen = new Set<number>();
    for (let i = 0; i < 4; i++) {
      const r = await startSoloRound(db, u);
      seen.add(r.topic.id);
      await skipSoloRound(db, u, r.id);
    }
    expect(seen.size).toBe(4); // 4 fixture topics, all different
    const rows = await db.select().from(soloRounds).where(eq(soloRounds.userId, u));
    expect(rows.every((x) => x.status === "ABANDONED")).toBe(true);
    expect((await getPublicTopic(db, [...seen][0])).id).toBeTruthy();
  });
});

describe("leaderboards", () => {
  it("ranks by points within national, state and university scopes", async () => {
    // Fresh country so earlier tests' players don't interfere.
    const a = await player("Alpha", "CA", stanford, "US");
    const b = await player("Bravo", "CA", stanford, "US");
    const c = await player("Charlie", "NY", stanford, "US");
    await playRound(a, 2, 4); // 6
    await playRound(b, 3, 3); // 6, but later → ranked after Alpha
    await playRound(c, 5, 6); // 11

    const national = await getLeaderboard(db, { scope: "national", country: "US" }, b);
    expect(national.entries.map((e) => e.displayName)).toEqual(["Charlie", "Alpha", "Bravo"]);
    expect(national.entries.map((e) => e.rank)).toEqual([1, 2, 3]);
    expect(national.me).toEqual({ rank: 3, totalPoints: 6 });
    expect(national.entries.find((e) => e.isMe)?.displayName).toBe("Bravo");

    const ca = await getLeaderboard(db, { scope: "state", country: "US", state: "CA" }, null);
    expect(ca.title).toBe("California");
    expect(ca.entries.map((e) => e.displayName)).toEqual(["Alpha", "Bravo"]);

    const uni = await getLeaderboard(db, { scope: "university", country: "US", university: stanford }, c);
    expect(uni.totalPlayers).toBe(3);
    expect(uni.me?.rank).toBe(1);

    const profile = (await getProfile(db, b))!;
    expect(profile.ranks).toEqual({ national: 3, state: 2, university: 3 });
  });

  it("hides players who haven't finished a round and validates input", async () => {
    await player("Lurker", "TX", stanford, "US");
    const board = await getLeaderboard(db, { scope: "national", country: "US" }, null);
    expect(board.entries.some((e) => e.displayName === "Lurker")).toBe(false);
    await expect(getLeaderboard(db, { scope: "state", country: "US", state: "XX" }, null)).rejects.toThrow();
    await expect(getLeaderboard(db, { scope: "national", country: "DE" }, null)).rejects.toThrow();
  });
});
