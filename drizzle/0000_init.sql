CREATE TYPE "public"."difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."game_state" AS ENUM('LOBBY', 'PREDICTION', 'TOPIC_REVEAL', 'ANSWERING', 'ROUND_PROCESSING', 'ROUND_LEADERBOARD', 'GAME_FINISHED');--> statement-breakpoint
CREATE TYPE "public"."round_status" AS ENUM('PREDICTION', 'TOPIC_REVEAL', 'ANSWERING', 'PROCESSING', 'COMPLETE', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "answer_aliases" (
	"id" serial PRIMARY KEY NOT NULL,
	"answer_id" integer NOT NULL,
	"alias" text NOT NULL,
	"normalized_alias" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic_id" integer NOT NULL,
	"canonical_answer" text NOT NULL,
	"normalized_answer" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"icon" text DEFAULT 'sparkles' NOT NULL,
	"source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "game_rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"topic_id" integer NOT NULL,
	"round_number" integer NOT NULL,
	"status" "round_status" DEFAULT 'PREDICTION' NOT NULL,
	"prediction_deadline" timestamp with time zone NOT NULL,
	"revealed_at" timestamp with time zone,
	"answering_starts_at" timestamp with time zone,
	"answering_deadline" timestamp with time zone,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_code" text NOT NULL,
	"moderator_token_hash" text NOT NULL,
	"name" text NOT NULL,
	"host_name" text,
	"total_rounds" integer NOT NULL,
	"round_duration" integer DEFAULT 20 NOT NULL,
	"prediction_duration" integer DEFAULT 30 NOT NULL,
	"category_ids" integer[],
	"current_round" integer DEFAULT 0 NOT NULL,
	"current_state" "game_state" DEFAULT 'LOBBY' NOT NULL,
	"state_version" integer DEFAULT 0 NOT NULL,
	"next_game_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	CONSTRAINT "games_game_code_unique" UNIQUE("game_code")
);
--> statement-breakpoint
CREATE TABLE "participant_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"round_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"answer_id" integer,
	"submitted_text" text NOT NULL,
	"normalized_text" text NOT NULL,
	"is_valid" boolean NOT NULL,
	"is_duplicate" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"name_key" text NOT NULL,
	"session_token_hash" text NOT NULL,
	"avatar" integer DEFAULT 0 NOT NULL,
	"total_score" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_connected" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"round_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"predicted_count" integer NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "round_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"round_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"predicted_count" integer,
	"valid_answer_count" integer NOT NULL,
	"points_awarded" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"prompt" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"difficulty" "difficulty" DEFAULT 'medium' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "answer_aliases" ADD CONSTRAINT "answer_aliases_answer_id_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."answers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_rounds" ADD CONSTRAINT "game_rounds_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_rounds" ADD CONSTRAINT "game_rounds_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_answers" ADD CONSTRAINT "participant_answers_round_id_game_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."game_rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_answers" ADD CONSTRAINT "participant_answers_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_answers" ADD CONSTRAINT "participant_answers_answer_id_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."answers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_round_id_game_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."game_rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "round_scores" ADD CONSTRAINT "round_scores_round_id_game_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."game_rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "round_scores" ADD CONSTRAINT "round_scores_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "answer_aliases_answer_normalized_uq" ON "answer_aliases" USING btree ("answer_id","normalized_alias");--> statement-breakpoint
CREATE INDEX "answer_aliases_normalized_idx" ON "answer_aliases" USING btree ("normalized_alias");--> statement-breakpoint
CREATE UNIQUE INDEX "answers_topic_normalized_uq" ON "answers" USING btree ("topic_id","normalized_answer");--> statement-breakpoint
CREATE INDEX "answers_topic_idx" ON "answers" USING btree ("topic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "game_rounds_game_number_uq" ON "game_rounds" USING btree ("game_id","round_number");--> statement-breakpoint
CREATE UNIQUE INDEX "game_rounds_game_topic_uq" ON "game_rounds" USING btree ("game_id","topic_id");--> statement-breakpoint
CREATE INDEX "games_created_idx" ON "games" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "participant_answers_text_uq" ON "participant_answers" USING btree ("round_id","participant_id","normalized_text");--> statement-breakpoint
CREATE UNIQUE INDEX "participant_answers_credit_uq" ON "participant_answers" USING btree ("round_id","participant_id","answer_id") WHERE "participant_answers"."is_valid" = true AND "participant_answers"."is_duplicate" = false;--> statement-breakpoint
CREATE INDEX "participant_answers_round_idx" ON "participant_answers" USING btree ("round_id","participant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "participants_game_name_uq" ON "participants" USING btree ("game_id","name_key");--> statement-breakpoint
CREATE UNIQUE INDEX "participants_game_token_uq" ON "participants" USING btree ("game_id","session_token_hash");--> statement-breakpoint
CREATE INDEX "participants_game_idx" ON "participants" USING btree ("game_id");--> statement-breakpoint
CREATE UNIQUE INDEX "predictions_round_participant_uq" ON "predictions" USING btree ("round_id","participant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "round_scores_round_participant_uq" ON "round_scores" USING btree ("round_id","participant_id");--> statement-breakpoint
CREATE INDEX "topics_category_idx" ON "topics" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "topics_active_idx" ON "topics" USING btree ("is_active");