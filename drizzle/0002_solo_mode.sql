CREATE TYPE "public"."solo_round_status" AS ENUM('PREDICTION', 'ANSWERING', 'COMPLETE', 'ABANDONED');--> statement-breakpoint
CREATE TABLE "player_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"country" text NOT NULL,
	"state_code" text NOT NULL,
	"university_id" integer NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"rounds_played" integer DEFAULT 0 NOT NULL,
	"bids_hit" integer DEFAULT 0 NOT NULL,
	"best_round" integer DEFAULT 0 NOT NULL,
	"points_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "solo_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"round_id" uuid NOT NULL,
	"answer_id" integer,
	"submitted_text" text NOT NULL,
	"normalized_text" text NOT NULL,
	"is_valid" boolean NOT NULL,
	"is_duplicate" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "solo_rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"topic_id" integer NOT NULL,
	"status" "solo_round_status" DEFAULT 'PREDICTION' NOT NULL,
	"predicted_count" integer,
	"round_duration" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"answering_starts_at" timestamp with time zone,
	"answering_deadline" timestamp with time zone,
	"valid_count" integer,
	"points" integer,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "universities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_key" text NOT NULL,
	"country" text NOT NULL,
	"state_code" text NOT NULL,
	"is_custom" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "player_profiles" ADD CONSTRAINT "player_profiles_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solo_answers" ADD CONSTRAINT "solo_answers_round_id_solo_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."solo_rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solo_answers" ADD CONSTRAINT "solo_answers_answer_id_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."answers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solo_rounds" ADD CONSTRAINT "solo_rounds_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "player_profiles_national_idx" ON "player_profiles" USING btree ("country","total_points");--> statement-breakpoint
CREATE INDEX "player_profiles_state_idx" ON "player_profiles" USING btree ("country","state_code","total_points");--> statement-breakpoint
CREATE INDEX "player_profiles_university_idx" ON "player_profiles" USING btree ("university_id","total_points");--> statement-breakpoint
CREATE INDEX "solo_answers_round_idx" ON "solo_answers" USING btree ("round_id");--> statement-breakpoint
CREATE UNIQUE INDEX "solo_answers_credit_idx" ON "solo_answers" USING btree ("round_id","answer_id") WHERE is_valid AND NOT is_duplicate;--> statement-breakpoint
CREATE INDEX "solo_rounds_user_idx" ON "solo_rounds" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "solo_rounds_one_open_idx" ON "solo_rounds" USING btree ("user_id") WHERE status IN ('PREDICTION', 'ANSWERING');--> statement-breakpoint
CREATE UNIQUE INDEX "universities_country_name_key" ON "universities" USING btree ("country","name_key");--> statement-breakpoint
CREATE INDEX "universities_country_state_idx" ON "universities" USING btree ("country","state_code");