DROP TABLE "user_profiles";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "locale" "locale" DEFAULT 'en'::"locale" NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_completed" boolean DEFAULT false NOT NULL;