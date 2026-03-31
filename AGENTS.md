<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:talendly-agent-rules -->

# Talendly

Read the following guidelines carefully before writing any code. This document contains the architectural overview, database schema, and domain logic for Talendly, a salary-transparent reverse job board for Greece & Cyprus.

> Salary-transparent, candidate-first reverse job board for Greece & Cyprus.
> Bilingual (el/en). Trust-first. Privacy by default.

---

## Stack

- **Framework:** Next.js 16+ (App Router)
- **Database:** PostgreSQL (PlanetScale) via Drizzle ORM
- **Auth:** Better Auth (Drizzle adapter) — Google + LinkedIn OAuth, email/password
- **Payments:** Stripe (subscriptions, one-time purchases, customer portal)
- **Email:** Resend
- **Storage:** Cloudflare R2 (docs, logos)
- **Rate Limiting:** Upstash Redis (sliding window)
- **Deployment:** Vercel

---

## Architecture Conventions

- **Server Actions** for all internal mutations.
- **API Routes (`/api/*`)** only for: Better Auth catch-all, Stripe webhooks, Resend webhooks, OG image generation, health check, sitemap, and queries that need to be fetched from the client.
- All tables use **UUID v4** primary keys, `created_at`/`updated_at` timestamps, and soft-delete (`deleted_at`) where noted.
- Drizzle schema files organized per domain under `src/server/database/schema/`.
- Server actions and route handlers should be created using the provided `createServerAction` and `createRouteHandler` wrappers respectively for consistent error handling and return types, unless the requirements of the action or endpoint dictate otherwise (e.g. Stripe webhooks must use raw body parsing).
- Server actions and route handlers should utilize the async hooks-based database context for automatic connection management and transaction scoping. See `src/server/async-hooks/db.ts` for details.
- Database access should be handled through `getDatabaseFromContext` when wrapped within `runWithDatabase` or `runWithTransaction`, never imported directly. This ensures proper connection management and transaction scoping.
- Every domain (auth, candidates, employers, jobs, messaging, billing, etc.) should have a corresponding directory under `src/modules/` that encapsulates all business logic, database interactions, API calls, components, etc... for that domain. Server actions and route handlers should call into these services rather than directly accessing the database or implementing complex logic themselves.

---

## Database Schema Summary

### Users & Auth

- **`user`** — Better Auth managed (id, name, email, emailVerified, image)
- **`session`** — Better Auth managed
- **`account`** — Better Auth managed (OAuth providers)
- **`verification`** — Better Auth managed
- **`user_profiles`** — 1:1 extension: locale (`el`|`en`), is_active, last_login_at. Created automatically on signup with defaults. All authenticated users are candidates; there is no exclusive role. Employer access is determined by having a linked `employers` record. Admin status is managed by the Better Auth admin plugin via `users.role`.

### Candidates

- **`candidate_profiles`** — anonymous_id (public slug like `TL-8f3a2b`), headline/summary (JSONB bilingual), industry, role_category, years_of_experience, location (city + country GR/CY), work_preference, employment_type[], salary fields (min/target/currency/period), availability_status, notice_period_days, is_verified, profile_strength (0-100), visibility (`visible`|`hidden`|`auto_hidden`), last_active_at
- **`candidate_skills`** — skill_tag + proficiency (beginner→expert), max 25 per profile
- **`candidate_languages`** — language_code + proficiency (basic→native)
- **`candidate_certifications`** — name, issuing_org, dates
- **`candidate_preferences`** — preferred industries/roles/locations, min_company_size, exclude_companies, open_to_relocation

### Employers

- **`employers`** — company_name, legal_entity, tax_id, website, industry, company_size, hiring_regions (GR/CY), contact_role, logo_url, description (JSONB), verification_status (`pending`→`verified`→`suspended`), trust_score (0-100), billing_status, stripe_customer_id
- **`employer_verifications`** — submitted_email/domain/website, supporting_docs (R2 URLs), reviewer_id, decision, review_notes

### Billing

- **`pricing_plans`** — slug (starter/growth/pro), name (JSONB), price_cents, quotas (job_posts, cv_views, messages), stripe_price_id
- **`subscriptions`** — employer_id, plan_id, stripe_subscription_id, status, period dates, cancel_at_period_end
- **`credit_balances`** — employer_id (unique), cv_views_remaining, messages_remaining, job_posts_remaining
- **`credit_transactions`** — credit_type, amount (+/-), source (subscription_reset/purchase/usage/admin_grant/refund), reference_id

### Unlocks & Views

- **`candidate_profile_views`** — candidate_id + employer_id (unique pair), viewed_at
- **`profile_unlocks`** — candidate_id + employer_id (unique pair), unlock_type (credit/subscription/pay_per_unlock), stripe_payment_id. Permanent once created.

### Messaging

- **`employer_invitations`** — employer→candidate, optional job_post_id, message (≥50 chars), status (pending/accepted/declined/expired), expires after 14 days. Max 1 per candidate per 30 days. Named `employer_invitations` (not `invitations`) to avoid conflict with the Better Auth organization plugin's `invitations` table.
- **`messages`** — thread_id groups conversations, sender_id, recipient_id, body, is_read. Only available after invitation accepted or profile unlocked + candidate consent.

### Jobs

- **`job_posts`** — employer_id, title/description (JSONB bilingual), industry, role_category, location, work_mode, employment_type, salary range, required_skills[], required_languages[], status (draft→published→closed/expired/removed), published_at, expires_at (default 30 days)
- **`job_applications`** — job_post_id + candidate_id (unique), cover_note, status (submitted→reviewed→shortlisted→rejected→withdrawn)

### Moderation

- **`reports`** — reporter_id, reported entity type/id, reason, status, reviewer, resolution
- **`admin_reviews`** — admin_id, entity, action (approve/reject/suspend/warn/restore), notes
- **`blocked_relationships`** — blocker_id + blocked_id

### Activity & Upgrades

- **`activity_logs`** — user_id, action, entity_type/id, metadata (JSONB), ip_address
- **`candidate_upgrades`** — upgrade_type (verified_badge/premium_cv/visibility_boost), stripe fields, status, expiry

---

## Auth & Authorization

### Better Auth Config

- Email/password + Google + LinkedIn OAuth
- Sessions: 7 day expiry, daily refresh
- Catch-all route: `/api/auth/[...all]/route.ts`

### Role-Based Access

Roles are **additive, not exclusive**. All authenticated users are candidates. A user can additionally become an employer — they do not stop being a candidate.

| Access Level | Condition                                      | Access                                        |
| ------------ | ---------------------------------------------- | --------------------------------------------- |
| `admin`      | `users.role = 'admin'` (Better Auth managed)   | Full platform access                          |
| `employer`   | Authenticated + has a linked `employers` record | Employer features gated by verification_status + billing_status; candidate access retained |
| `candidate`  | Any authenticated user                         | Standard authenticated access                 |
| `public`     | Unauthenticated                                | Published job listings, landing pages         |

### Employer Access Matrix

| Capability      | Unverified  | Verified + No Plan  | Verified + Active Plan |
| --------------- | ----------- | ------------------- | ---------------------- |
| Browse previews | 5/day limit | Yes                 | Yes                    |
| Unlock profiles | No          | Pay-per-unlock only | Credits from plan      |
| Send messages   | No          | No                  | Yes (within quota)     |
| Post jobs       | No          | No                  | Yes (within quota)     |

### Server Action Guard Composition

```
withAuth → withRole('employer') → withVerifiedEmployer → withCreditCheck('cv_view') → handler
```

Available guards: `withAuth`, `withRole`, `withVerifiedEmployer`, `withAdmin`, `withRateLimit`, `withCreditCheck`

> `withRole('employer')` checks for the existence of a linked `employers` record for the current user, not a role field on `user_profiles`.

---

## Core Domains

### Candidate Profile

- Profile strength score (0-100): headline 10pts, summary 10pts, industry 5pts, role 5pts, experience 5pts, location 5pts, work_pref 5pts, employment_type 5pts, salary 10pts, skills≥3 10pts, languages≥1 5pts, certs≥1 5pts, availability 5pts, notice_period 5pts, bilingual bonus 10pts
- Profiles below 40% strength excluded from search
- Auto-hide after 60 days inactive, reminder at 45 days
- Server actions: createCandidateProfile, updateCandidateProfile, updateVisibility, updateSalaryExpectations, skill/language/cert CRUD, preferences CRUD

### Employer Account

- Verification flow: submit → in_review → approved/rejected/needs_info
- Trust score (0-100): base 50, +20 verification, +10 active subscription, +10 response rate >70%, +10 zero reports, -15 per upheld report, -5 inactivity >30d, -10 past_due billing
- Server actions: createEmployerAccount, updateEmployerProfile, submitVerification, getEmployerDashboard

### Search & Matching

- Candidate search: filters by industry, role, location, work_preference, employment_types, salary range, skills, languages, experience, availability. Only `visible` + `strength >= 40` profiles.
- Relevance score: `0.25*role + 0.20*skills + 0.20*salary + 0.15*location + 0.10*recency + 0.10*profile_strength`
- Job search: only published jobs from verified employers with active billing
- Skill tag autocomplete: bilingual taxonomy, top 10 matches

### Unlocks & Credits

- Unlock requires verified employer + active billing (or single purchase)
- Deducts from credit_balances → creates profile_unlocks + credit_transactions
- Unlocks are permanent (no re-locking on downgrade)
- Falls back to Stripe checkout for pay-per-unlock if no credits

### Invitations & Messaging

- Invitation limits: Starter 5/day, Growth 15/day, Pro 30/day
- Message ≥50 chars (personalization requirement)
- Max 1 invitation per candidate per 30 days
- 50 messages/day employer cap across all threads
- No URLs or attachments in MVP (anti-spam)
- Anti-spam: duplicate message detection within 1hr, >70% decline rate triggers trust penalty

### Job Posts

- Draft creation free, quota deducted on publish
- Default expiry: 30 days from publish
- Applications: candidate submits with optional cover note, employer manages statuses

---

## Payments & Billing

### Pricing Plans

| Plan    | Price/mo | Job Posts | CV Views  | Messages |
| ------- | -------- | --------- | --------- | -------- |
| Starter | €99      | 1         | 30        | 5        |
| Growth  | €199     | 3         | 100       | 25       |
| Pro     | €399     | 10        | Unlimited | 100      |

### Candidate Upgrades

- Verified Badge: €9 one-time
- Premium CV Builder: €14.99 one-time
- Visibility Boost: €9.99/month

### Pay-As-You-Go

- Single Unlock: €4.90 / 1 CV
- Mini Pack: €19.90 / 5 CVs
- Bulk Offer: Dynamic pricing

### Stripe Webhook Events

- `checkout.session.completed` → activate subscription or credit pack
- `invoice.paid` → monthly renewal, reset credits to plan quota
- `invoice.payment_failed` → set billing_status = past_due
- `customer.subscription.updated` → handle upgrade/downgrade
- `customer.subscription.deleted` → set inactive, zero credits

---

## Admin & Moderation

- Employer verification queue: review pending/in_review submissions
- Report queue: filterable by entity type, resolve/dismiss with optional penalties
- User suspension/restoration
- Trust score manual adjustment + automated recalculation
- Admin dashboard: total users by role, verification pipeline, active subs, MRR, stale accounts, report volume
- All admin actions logged to `admin_reviews` for audit trail

---

## Cron Jobs

| Schedule              | Task                                             |
| --------------------- | ------------------------------------------------ |
| Daily 03:00 UTC       | Auto-hide profiles inactive 60+ days             |
| Daily 03:00 UTC       | Email inactivity reminders at 45 days            |
| Daily 04:00 UTC       | Expire employer_invitations past expiry date     |
| Daily 04:00 UTC       | Expire published job posts past expiry           |
| Daily 05:00 UTC       | Prompt employer reactivation (90+ days inactive) |
| Daily 06:00 UTC       | GDPR hard-delete (deleted_at > 30 days ago)      |
| Weekly Sun 02:00 UTC  | Recalculate all employer trust scores            |
| Weekly Sun 03:00 UTC  | Recalculate all candidate profile strength       |
| Monthly 1st 06:00 UTC | Generate monthly KPI snapshots                   |

---

## Rate Limits

| Action                        | Limit                | Window            |
| ----------------------------- | -------------------- | ----------------- |
| Sign up                       | 5                    | per IP/hour       |
| Password reset                | 3                    | per email/hour    |
| Candidate search (unverified) | 5 previews           | per day           |
| Send invitation               | 5/15/30 (plan-based) | per day           |
| Send message                  | 50                   | per employer/day  |
| Apply to job                  | 20                   | per candidate/day |
| Record profile view           | 200                  | per employer/day  |
| Report user                   | 10                   | per user/day      |

---

## Error Handling

### Server Action Return Type

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        statusCode: number;
        code: string;
        message: string;
        details?: Record<string, unknown>;
      };
    };
```

### Error Codes

`AUTH_REQUIRED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `QUOTA_EXCEEDED`, `RATE_LIMITED`, `CONFLICT`, `PAYMENT_REQUIRED`, `INTERNAL_ERROR`

### API Route Status Codes

200 success, 400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 429 rate limited (+ Retry-After), 500 internal

---

## Environment Variables

```
DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET,
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET,
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PUBLISHABLE_KEY,
RESEND_API_KEY, EMAIL_FROM,
R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET,
UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN,
NEXT_PUBLIC_SITE_URL (https://talendly.io), NEXT_PUBLIC_DEFAULT_LOCALE (en|el)
```

---

## Target Market

- **Region:** Greece & Cyprus
- **Initial niches:** Healthcare, Hospitality & Tourism, Tech & Marketing
- **Languages:** Greek (default), English

## MVP Scope

Candidate signup/onboarding, anonymous profiles, employer signup/verification, employer dashboard, candidate search/filters, profile preview + unlock, limited messaging/invitations, Stripe payments, admin moderation, candidate analytics (views, responses, matches).

**Not MVP:** Advanced AI matching, recruiter workflows, ATS integrations, recommendation engine, enterprise SSO, mobile app.

<!-- END:talendly-agent-rules -->
