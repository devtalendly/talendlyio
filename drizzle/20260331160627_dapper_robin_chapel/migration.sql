CREATE TYPE "availability_status" AS ENUM('available', 'available_soon', 'not_available');--> statement-breakpoint
CREATE TYPE "candidate_visibility" AS ENUM('visible', 'hidden', 'auto_hidden');--> statement-breakpoint
CREATE TYPE "country" AS ENUM('GR', 'CY');--> statement-breakpoint
CREATE TYPE "employment_type" AS ENUM('full_time', 'part_time', 'contract', 'freelance', 'internship');--> statement-breakpoint
CREATE TYPE "language_proficiency" AS ENUM('basic', 'conversational', 'professional', 'fluent', 'native');--> statement-breakpoint
CREATE TYPE "salary_currency" AS ENUM('EUR', 'USD', 'GBP');--> statement-breakpoint
CREATE TYPE "salary_period" AS ENUM('monthly', 'annual');--> statement-breakpoint
CREATE TYPE "skill_proficiency" AS ENUM('beginner', 'intermediate', 'advanced', 'expert');--> statement-breakpoint
CREATE TYPE "work_preference" AS ENUM('remote', 'hybrid', 'onsite', 'flexible');--> statement-breakpoint
CREATE TABLE "candidate_certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"candidate_profile_id" uuid NOT NULL,
	"name" text NOT NULL,
	"issuing_org" text,
	"issue_date" timestamp,
	"expiry_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_languages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"candidate_profile_id" uuid NOT NULL,
	"language_code" text NOT NULL,
	"proficiency" "language_proficiency" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"candidate_profile_id" uuid NOT NULL UNIQUE,
	"preferred_industries" text[],
	"preferred_roles" text[],
	"preferred_locations" text[],
	"min_company_size" text,
	"exclude_companies" text[],
	"open_to_relocation" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL UNIQUE,
	"public_id" text NOT NULL UNIQUE,
	"headline" jsonb,
	"summary" jsonb,
	"industry" text,
	"role_category" text,
	"years_of_experience" integer,
	"location_city" text,
	"location_country" "country",
	"work_preference" "work_preference",
	"employment_types" "employment_type"[],
	"salary_min" integer,
	"salary_target" integer,
	"salary_currency" "salary_currency" DEFAULT 'EUR'::"salary_currency",
	"salary_period" "salary_period" DEFAULT 'monthly'::"salary_period",
	"availability_status" "availability_status",
	"notice_period_days" integer,
	"is_verified" boolean DEFAULT false NOT NULL,
	"profile_strength" integer DEFAULT 0 NOT NULL,
	"visibility" "candidate_visibility" DEFAULT 'visible'::"candidate_visibility" NOT NULL,
	"last_active_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"candidate_profile_id" uuid NOT NULL,
	"skill_tag" text NOT NULL,
	"proficiency" "skill_proficiency" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "candidate_certification_profile_id_idx" ON "candidate_certifications" ("candidate_profile_id");--> statement-breakpoint
CREATE INDEX "candidate_language_profile_id_idx" ON "candidate_languages" ("candidate_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "candidate_language_code_uidx" ON "candidate_languages" ("candidate_profile_id","language_code");--> statement-breakpoint
CREATE INDEX "candidate_preferences_profile_id_idx" ON "candidate_preferences" ("candidate_profile_id");--> statement-breakpoint
CREATE INDEX "candidate_profile_user_id_idx" ON "candidate_profiles" ("user_id");--> statement-breakpoint
CREATE INDEX "candidate_profile_public_id_idx" ON "candidate_profiles" ("public_id");--> statement-breakpoint
CREATE INDEX "candidate_profile_visibility_idx" ON "candidate_profiles" ("visibility");--> statement-breakpoint
CREATE INDEX "candidate_skill_profile_id_idx" ON "candidate_skills" ("candidate_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "candidate_skill_tag_uidx" ON "candidate_skills" ("candidate_profile_id","skill_tag");--> statement-breakpoint
ALTER TABLE "candidate_certifications" ADD CONSTRAINT "candidate_certifications_bSqOiy3C1FFO_fkey" FOREIGN KEY ("candidate_profile_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "candidate_languages" ADD CONSTRAINT "candidate_languages_Kt8J9gJrmPfq_fkey" FOREIGN KEY ("candidate_profile_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "candidate_preferences" ADD CONSTRAINT "candidate_preferences_6IHNSBxPMDrp_fkey" FOREIGN KEY ("candidate_profile_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_BVtYywBhDDpt_fkey" FOREIGN KEY ("candidate_profile_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE;