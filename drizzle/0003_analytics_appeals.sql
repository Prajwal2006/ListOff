CREATE TYPE "public"."appeal_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"path" text,
	"anon_id" text,
	"referrer" text,
	"device" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "answer_appeals" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic_id" integer NOT NULL,
	"submitted_text" text NOT NULL,
	"normalized_text" text NOT NULL,
	"note" text,
	"status" "appeal_status" DEFAULT 'PENDING' NOT NULL,
	"report_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_reported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "answer_appeals" ADD CONSTRAINT "answer_appeals_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_events_created_idx" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "analytics_events_name_idx" ON "analytics_events" USING btree ("name","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "answer_appeals_topic_text_idx" ON "answer_appeals" USING btree ("topic_id","normalized_text");--> statement-breakpoint
CREATE INDEX "answer_appeals_status_idx" ON "answer_appeals" USING btree ("status","last_reported_at");