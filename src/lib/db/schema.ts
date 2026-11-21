import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

/* ────────────────────────────── Enums ────────────────────────────── */

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

export const gameStateEnum = pgEnum("game_state", [
  "LOBBY",
  "PREDICTION",
  "TOPIC_REVEAL",
  "ANSWERING",
  "ROUND_PROCESSING",
  "ROUND_LEADERBOARD",
  "GAME_FINISHED",
]);

export const roundStatusEnum = pgEnum("round_status", [
  "PREDICTION",
  "TOPIC_REVEAL",
  "ANSWERING",
  "PROCESSING",
  "COMPLETE",
  "CANCELLED",
]);

/* ───────────────────────── Knowledge base ────────────────────────── */

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  icon: text("icon").notNull().default("sparkles"),
  source: text("source"),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const topics = pgTable(
  "topics",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    /** The line shown on the reveal screen, e.g. "Name as many fruits as you can". */
    prompt: text("prompt").notNull(),
    description: text("description").notNull().default(""),
    difficulty: difficultyEnum("difficulty").notNull().default("medium"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("topics_category_idx").on(t.categoryId), index("topics_active_idx").on(t.isActive)],
);

export const answers = pgTable(
  "answers",
  {
    id: serial("id").primaryKey(),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    canonicalAnswer: text("canonical_answer").notNull(),
    normalizedAnswer: text("normalized_answer").notNull(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [
    uniqueIndex("answers_topic_normalized_uq").on(t.topicId, t.normalizedAnswer),
    index("answers_topic_idx").on(t.topicId),
  ],
);

export const answerAliases = pgTable(
  "answer_aliases",
  {
    id: serial("id").primaryKey(),
    answerId: integer("answer_id")
      .notNull()
      .references(() => answers.id, { onDelete: "cascade" }),
    alias: text("alias").notNull(),
    normalizedAlias: text("normalized_alias").notNull(),
  },
  (t) => [
    uniqueIndex("answer_aliases_answer_normalized_uq").on(t.answerId, t.normalizedAlias),
    index("answer_aliases_normalized_idx").on(t.normalizedAlias),
  ],
);

/* ─────────────────────────────── Games ───────────────────────────── */

export const games = pgTable(
  "games",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gameCode: text("game_code").notNull().unique(),
    moderatorTokenHash: text("moderator_token_hash").notNull(),
    name: text("name").notNull(),
    hostName: text("host_name"),
    totalRounds: integer("total_rounds").notNull(),
    roundDuration: integer("round_duration").notNull().default(20),
    predictionDuration: integer("prediction_duration").notNull().default(30),
    /** Optional category restriction (null = all categories). */
    categoryIds: integer("category_ids").array(),
    currentRound: integer("current_round").notNull().default(0),
    currentState: gameStateEnum("current_state").notNull().default("LOBBY"),
    /** Bumped on every state-visible mutation; lets clients skip unchanged snapshots. */
    stateVersion: integer("state_version").notNull().default(0),
    /** Set when the moderator hits "Play again" — clients follow it to the rematch. */
    nextGameId: uuid("next_game_id"),
    createdAt: ts("created_at").notNull().defaultNow(),
    startedAt: ts("started_at"),
    finishedAt: ts("finished_at"),
  },
  (t) => [index("games_created_idx").on(t.createdAt)],
);

export const participants = pgTable(
  "participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    /** Lower-cased, whitespace-collapsed display name — prevents two "Sam"s in one lobby. */
    nameKey: text("name_key").notNull(),
    sessionTokenHash: text("session_token_hash").notNull(),
    avatar: integer("avatar").notNull().default(0),
    totalScore: integer("total_score").notNull().default(0),
    joinedAt: ts("joined_at").notNull().defaultNow(),
    lastSeenAt: ts("last_seen_at").notNull().defaultNow(),
    isConnected: boolean("is_connected").notNull().default(true),
  },
  (t) => [
    uniqueIndex("participants_game_name_uq").on(t.gameId, t.nameKey),
    uniqueIndex("participants_game_token_uq").on(t.gameId, t.sessionTokenHash),
    index("participants_game_idx").on(t.gameId),
  ],
);

export const gameRounds = pgTable(
  "game_rounds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id),
    roundNumber: integer("round_number").notNull(),
    status: roundStatusEnum("status").notNull().default("PREDICTION"),
    predictionDeadline: ts("prediction_deadline").notNull(),
    revealedAt: ts("revealed_at"),
    answeringStartsAt: ts("answering_starts_at"),
    answeringDeadline: ts("answering_deadline"),
    processedAt: ts("processed_at"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("game_rounds_game_number_uq").on(t.gameId, t.roundNumber),
    uniqueIndex("game_rounds_game_topic_uq").on(t.gameId, t.topicId),
  ],
);

export const predictions = pgTable(
  "predictions",
  {
    id: serial("id").primaryKey(),
    roundId: uuid("round_id")
      .notNull()
      .references(() => gameRounds.id, { onDelete: "cascade" }),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    predictedCount: integer("predicted_count").notNull(),
    submittedAt: ts("submitted_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("predictions_round_participant_uq").on(t.roundId, t.participantId)],
);

export const participantAnswers = pgTable(
  "participant_answers",
  {
    id: serial("id").primaryKey(),
    roundId: uuid("round_id")
      .notNull()
      .references(() => gameRounds.id, { onDelete: "cascade" }),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    answerId: integer("answer_id").references(() => answers.id),
    submittedText: text("submitted_text").notNull(),
    normalizedText: text("normalized_text").notNull(),
    isValid: boolean("is_valid").notNull(),
    isDuplicate: boolean("is_duplicate").notNull().default(false),
    submittedAt: ts("submitted_at").notNull().defaultNow(),
  },
  (t) => [
    // The same typed text can only be stored once per player per round.
    uniqueIndex("participant_answers_text_uq").on(t.roundId, t.participantId, t.normalizedText),
    // A canonical answer can only be credited once per player per round, even via different aliases
    // or concurrent requests. Later hits are stored with is_duplicate = true.
    uniqueIndex("participant_answers_credit_uq")
      .on(t.roundId, t.participantId, t.answerId)
      .where(sql`${t.isValid} = true AND ${t.isDuplicate} = false`),
    index("participant_answers_round_idx").on(t.roundId, t.participantId),
  ],
);

export const roundScores = pgTable(
  "round_scores",
  {
    id: serial("id").primaryKey(),
    roundId: uuid("round_id")
      .notNull()
      .references(() => gameRounds.id, { onDelete: "cascade" }),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    predictedCount: integer("predicted_count"),
    validAnswerCount: integer("valid_answer_count").notNull(),
    pointsAwarded: integer("points_awarded").notNull(),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("round_scores_round_participant_uq").on(t.roundId, t.participantId)],
);

/* ───────────────────────────── Relations ─────────────────────────── */

export const categoriesRelations = relations(categories, ({ many }) => ({ topics: many(topics) }));
export const topicsRelations = relations(topics, ({ one, many }) => ({
  category: one(categories, { fields: [topics.categoryId], references: [categories.id] }),
  answers: many(answers),
}));
export const answersRelations = relations(answers, ({ one, many }) => ({
  topic: one(topics, { fields: [answers.topicId], references: [topics.id] }),
  aliases: many(answerAliases),
}));
export const answerAliasesRelations = relations(answerAliases, ({ one }) => ({
  answer: one(answers, { fields: [answerAliases.answerId], references: [answers.id] }),
}));

export type Game = typeof games.$inferSelect;
export type Participant = typeof participants.$inferSelect;
export type GameRound = typeof gameRounds.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type GameState = (typeof gameStateEnum.enumValues)[number];
export type RoundStatus = (typeof roundStatusEnum.enumValues)[number];
export type Difficulty = (typeof difficultyEnum.enumValues)[number];

/* ─────────────────────────────── Meta ────────────────────────────── */

/** Small key/value store for deployment bookkeeping (e.g. which knowledge-base version is loaded). */
export const appMeta = pgTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

/* ───────────────────────────── Solo mode ──────────────────────────── */
// Accounts live in Neon Auth (`neon_auth.user`, uuid ids). These tables reference that id without a
// foreign key so local PGlite dev/tests (which have no neon_auth schema) work the same way.

export const soloRoundStatusEnum = pgEnum("solo_round_status", ["PREDICTION", "ANSWERING", "COMPLETE", "ABANDONED"]);

/** Universities players can represent. Seeded for India and the US; players can add missing ones. */
export const universities = pgTable(
  "universities",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    nameKey: text("name_key").notNull(),
    country: text("country").notNull(), // "IN" | "US"
    stateCode: text("state_code").notNull(),
    isCustom: boolean("is_custom").notNull().default(false),
    createdBy: uuid("created_by"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("universities_country_name_key").on(t.country, t.nameKey),
    index("universities_country_state_idx").on(t.country, t.stateCode),
  ],
);

/** A signed-in player's solo identity and running total. One row per Neon Auth user. */
export const playerProfiles = pgTable(
  "player_profiles",
  {
    userId: uuid("user_id").primaryKey(),
    displayName: text("display_name").notNull(),
    country: text("country").notNull(),
    stateCode: text("state_code").notNull(),
    universityId: integer("university_id")
      .notNull()
      .references(() => universities.id),
    totalPoints: integer("total_points").notNull().default(0),
    roundsPlayed: integer("rounds_played").notNull().default(0),
    bidsHit: integer("bids_hit").notNull().default(0),
    bestRound: integer("best_round").notNull().default(0),
    /** When the current total was reached — earlier wins ties on the leaderboard. */
    pointsAt: ts("points_at").notNull().defaultNow(),
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("player_profiles_national_idx").on(t.country, t.totalPoints),
    index("player_profiles_state_idx").on(t.country, t.stateCode, t.totalPoints),
    index("player_profiles_university_idx").on(t.universityId, t.totalPoints),
  ],
);

/** One solo round: random topic, a bid, a server-timed answering window, then exactly-once scoring. */
export const soloRounds = pgTable(
  "solo_rounds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id),
    status: soloRoundStatusEnum("status").notNull().default("PREDICTION"),
    predictedCount: integer("predicted_count"),
    roundDuration: integer("round_duration").notNull(),
    createdAt: ts("created_at").notNull().defaultNow(),
    answeringStartsAt: ts("answering_starts_at"),
    answeringDeadline: ts("answering_deadline"),
    validCount: integer("valid_count"),
    points: integer("points"),
    completedAt: ts("completed_at"),
  },
  (t) => [
    index("solo_rounds_user_idx").on(t.userId, t.createdAt),
    // At most one unfinished round per player.
    uniqueIndex("solo_rounds_one_open_idx")
      .on(t.userId)
      .where(sql`status IN ('PREDICTION', 'ANSWERING')`),
  ],
);

export const soloAnswers = pgTable(
  "solo_answers",
  {
    id: serial("id").primaryKey(),
    roundId: uuid("round_id")
      .notNull()
      .references(() => soloRounds.id, { onDelete: "cascade" }),
    answerId: integer("answer_id").references(() => answers.id),
    submittedText: text("submitted_text").notNull(),
    normalizedText: text("normalized_text").notNull(),
    isValid: boolean("is_valid").notNull(),
    isDuplicate: boolean("is_duplicate").notNull().default(false),
    submittedAt: ts("submitted_at").notNull().defaultNow(),
  },
  (t) => [
    index("solo_answers_round_idx").on(t.roundId),
    uniqueIndex("solo_answers_credit_idx")
      .on(t.roundId, t.answerId)
      .where(sql`is_valid AND NOT is_duplicate`),
  ],
);

export type University = typeof universities.$inferSelect;
export type PlayerProfile = typeof playerProfiles.$inferSelect;
export type SoloRound = typeof soloRounds.$inferSelect;

/* ─────────────────────── Analytics & appeals ──────────────────────── */

/**
 * First-party, anonymous usage events (page views and game milestones). `anonId` is a random id the
 * browser generates itself; no IP address, user agent string or account id is stored.
 */
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(), // "page_view", "solo_round_started", …
    path: text("path"),
    anonId: text("anon_id"),
    referrer: text("referrer"), // hostname only
    device: text("device"), // "mobile" | "tablet" | "desktop"
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("analytics_events_created_idx").on(t.createdAt), index("analytics_events_name_idx").on(t.name, t.createdAt)],
);

export const appealStatusEnum = pgEnum("appeal_status", ["PENDING", "APPROVED", "REJECTED"]);

/** A player's "this should have counted" report. One row per topic + normalized text; repeats bump `reportCount`. */
export const answerAppeals = pgTable(
  "answer_appeals",
  {
    id: serial("id").primaryKey(),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    submittedText: text("submitted_text").notNull(),
    normalizedText: text("normalized_text").notNull(),
    note: text("note"),
    status: appealStatusEnum("status").notNull().default("PENDING"),
    reportCount: integer("report_count").notNull().default(1),
    createdAt: ts("created_at").notNull().defaultNow(),
    lastReportedAt: ts("last_reported_at").notNull().defaultNow(),
    resolvedAt: ts("resolved_at"),
  },
  (t) => [
    uniqueIndex("answer_appeals_topic_text_idx").on(t.topicId, t.normalizedText),
    index("answer_appeals_status_idx").on(t.status, t.lastReportedAt),
  ],
);

export type AnswerAppeal = typeof answerAppeals.$inferSelect;
