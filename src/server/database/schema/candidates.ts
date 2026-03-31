import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { users } from './auth';

export const countryEnum = pgEnum('country', ['GR', 'CY']);
export const employmentTypeEnum = pgEnum('employment_type', [
  'full_time',
  'part_time',
  'contract',
  'freelance',
  'internship',
]);
export const salaryCurrencyEnum = pgEnum('salary_currency', [
  'EUR',
  'USD',
  'GBP',
]);
export const salaryPeriodEnum = pgEnum('salary_period', ['monthly', 'annual']);

export const workPreferenceEnum = pgEnum('work_preference', [
  'remote',
  'hybrid',
  'onsite',
  'flexible',
]);
export const availabilityStatusEnum = pgEnum('availability_status', [
  'available',
  'available_soon',
  'not_available',
]);
export const candidateVisibilityEnum = pgEnum('candidate_visibility', [
  'visible',
  'hidden',
  'auto_hidden',
]);
export const skillProficiencyEnum = pgEnum('skill_proficiency', [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);
export const languageProficiencyEnum = pgEnum('language_proficiency', [
  'basic',
  'conversational',
  'professional',
  'fluent',
  'native',
]);

export type BilingualText = { el?: string; en?: string };

export const candidateProfiles = pgTable(
  'candidate_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    publicId: text('public_id').notNull().unique(),
    headline: jsonb('headline').$type<BilingualText>(),
    summary: jsonb('summary').$type<BilingualText>(),
    industry: text('industry'),
    roleCategory: text('role_category'),
    yearsOfExperience: integer('years_of_experience'),
    locationCity: text('location_city'),
    locationCountry: countryEnum('location_country'),
    workPreference: workPreferenceEnum('work_preference'),
    employmentTypes: employmentTypeEnum('employment_types').array(),
    salaryMin: integer('salary_min'),
    salaryTarget: integer('salary_target'),
    salaryCurrency: salaryCurrencyEnum('salary_currency').default('EUR'),
    salaryPeriod: salaryPeriodEnum('salary_period').default('monthly'),
    availabilityStatus: availabilityStatusEnum('availability_status'),
    noticePeriodDays: integer('notice_period_days'),
    isVerified: boolean('is_verified').notNull().default(false),
    profileStrength: integer('profile_strength').notNull().default(0),
    visibility: candidateVisibilityEnum('visibility')
      .notNull()
      .default('visible'),
    lastActiveAt: timestamp('last_active_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('candidate_profile_user_id_idx').on(t.userId),
    index('candidate_profile_public_id_idx').on(t.publicId),
    index('candidate_profile_visibility_idx').on(t.visibility),
  ],
);

export const candidateSkills = pgTable(
  'candidate_skills',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    candidateProfileId: uuid('candidate_profile_id')
      .notNull()
      .references(() => candidateProfiles.id, { onDelete: 'cascade' }),
    skillTag: text('skill_tag').notNull(),
    proficiency: skillProficiencyEnum('proficiency').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('candidate_skill_profile_id_idx').on(t.candidateProfileId),
    uniqueIndex('candidate_skill_tag_uidx').on(
      t.candidateProfileId,
      t.skillTag,
    ),
  ],
);

export const candidateLanguages = pgTable(
  'candidate_languages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    candidateProfileId: uuid('candidate_profile_id')
      .notNull()
      .references(() => candidateProfiles.id, { onDelete: 'cascade' }),
    languageCode: text('language_code').notNull(),
    proficiency: languageProficiencyEnum('proficiency').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('candidate_language_profile_id_idx').on(t.candidateProfileId),
    uniqueIndex('candidate_language_code_uidx').on(
      t.candidateProfileId,
      t.languageCode,
    ),
  ],
);

export const candidateCertifications = pgTable(
  'candidate_certifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    candidateProfileId: uuid('candidate_profile_id')
      .notNull()
      .references(() => candidateProfiles.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    issuingOrg: text('issuing_org'),
    issueDate: timestamp('issue_date'),
    expiryDate: timestamp('expiry_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('candidate_certification_profile_id_idx').on(t.candidateProfileId),
  ],
);

export const candidatePreferences = pgTable(
  'candidate_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    candidateProfileId: uuid('candidate_profile_id')
      .notNull()
      .unique()
      .references(() => candidateProfiles.id, { onDelete: 'cascade' }),
    preferredIndustries: text('preferred_industries').array(),
    preferredRoles: text('preferred_roles').array(),
    preferredLocations: text('preferred_locations').array(),
    minCompanySize: text('min_company_size'),
    excludeCompanies: text('exclude_companies').array(),
    openToRelocation: boolean('open_to_relocation').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('candidate_preferences_profile_id_idx').on(t.candidateProfileId),
  ],
);
