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
