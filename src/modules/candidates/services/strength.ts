import type {
  CandidateProfile,
  CandidateSkill,
  CandidateLanguage,
  CandidateCertification,
} from '@/server/database/types';
import type { Prettify } from '@/lib/types';

type StrengthInput = Prettify<
  Pick<
    CandidateProfile,
    | 'headline'
    | 'summary'
    | 'industry'
    | 'roleCategory'
    | 'yearsOfExperience'
    | 'locationCity'
    | 'locationCountry'
    | 'workPreference'
    | 'employmentTypes'
    | 'salaryMin'
    | 'salaryTarget'
    | 'availabilityStatus'
    | 'noticePeriodDays'
  >
>;

/**
 * Calculates profile strength score (0–100).
 *
 * Breakdown (100pts total):
 *   headline 10 | summary 10 | industry 5 | role 5 | experience 5
 *   location 5  | work_pref 5 | employment_type 5 | salary 10
 *   skills≥3 10 | languages≥1 5 | certs≥1 5 | availability 5
 *   notice_period 5 | bilingual bonus 10
 */
export function calculateProfileStrength(
  profile: StrengthInput,
  skills: Prettify<Pick<CandidateSkill, 'id'>>[],
  languages: Prettify<Pick<CandidateLanguage, 'id'>>[],
  certs: Prettify<Pick<CandidateCertification, 'id'>>[],
): number {
  let score = 0;

  const headline = profile.headline as { el?: string; en?: string } | null;
  const summary = profile.summary as { el?: string; en?: string } | null;

  const hasHeadline = !!(headline?.el || headline?.en);
  const hasSummary = !!(summary?.el || summary?.en);
  const isBilingual =
    !!(headline?.el && headline?.en) && !!(summary?.el && summary?.en);

  if (hasHeadline) score += 10;
  if (hasSummary) score += 10;
  if (profile.industry) score += 5;
  if (profile.roleCategory) score += 5;
  if (profile.yearsOfExperience != null) score += 5;
  if (profile.locationCity && profile.locationCountry) score += 5;
  if (profile.workPreference) score += 5;
  if (profile.employmentTypes && profile.employmentTypes.length > 0) score += 5;
  if (profile.salaryMin != null || profile.salaryTarget != null) score += 10;
  if (skills.length >= 3) score += 10;
  if (languages.length >= 1) score += 5;
  if (certs.length >= 1) score += 5;
  if (profile.availabilityStatus) score += 5;
  if (profile.noticePeriodDays != null) score += 5;
  if (isBilingual) score += 10;

  return Math.min(score, 100);
}
