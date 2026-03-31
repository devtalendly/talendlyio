import { z } from 'zod';

export const BilingualTextSchema = z
  .object({
    el: z.string().max(2000).optional(),
    en: z.string().max(2000).optional(),
  })
  .optional();

const CountrySchema = z.enum(['GR', 'CY']);
const WorkPreferenceSchema = z.enum(['remote', 'hybrid', 'onsite', 'flexible']);
const EmploymentTypeSchema = z.enum([
  'full_time',
  'part_time',
  'contract',
  'freelance',
  'internship',
]);
const AvailabilityStatusSchema = z.enum([
  'available',
  'available_soon',
  'not_available',
]);
const VisibilitySchema = z.enum(['visible', 'hidden', 'auto_hidden']);
const SalaryCurrencySchema = z.enum(['EUR', 'USD', 'GBP']);
const SalaryPeriodSchema = z.enum(['monthly', 'annual']);
const SkillProficiencySchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);
const LanguageProficiencySchema = z.enum([
  'basic',
  'conversational',
  'professional',
  'fluent',
  'native',
]);

export const CreateCandidateProfileSchema = z
  .object({
    headline: BilingualTextSchema,
    summary: BilingualTextSchema,
    industry: z.string().max(100).optional(),
    roleCategory: z.string().max(100).optional(),
    yearsOfExperience: z.number().int().min(0).max(60).optional(),
    locationCity: z.string().max(100).optional(),
    locationCountry: CountrySchema.optional(),
    workPreference: WorkPreferenceSchema.optional(),
    employmentTypes: z.array(EmploymentTypeSchema).optional(),
    salaryMin: z.number().int().min(0).optional(),
    salaryTarget: z.number().int().min(0).optional(),
    salaryCurrency: SalaryCurrencySchema.optional(),
    salaryPeriod: SalaryPeriodSchema.optional(),
    availabilityStatus: AvailabilityStatusSchema.optional(),
    noticePeriodDays: z.number().int().min(0).max(365).optional(),
  })
  .refine(
    (data) =>
      data.salaryMin && data.salaryTarget
        ? data.salaryMin <= data.salaryTarget
        : true,
    {
      error: 'Minimum salary must be less than or equal to target salary',
      path: ['salaryTarget'],
    },
  );

export type CreateCandidateProfileInput = z.input<
  typeof CreateCandidateProfileSchema
>;
export type CreateCandidateProfileOutput = z.infer<
  typeof CreateCandidateProfileSchema
>;

export const UpdateCandidateProfileSchema =
  CreateCandidateProfileSchema.partial();

export type UpdateCandidateProfileInput = z.input<
  typeof UpdateCandidateProfileSchema
>;
export type UpdateCandidateProfileOutput = z.infer<
  typeof UpdateCandidateProfileSchema
>;

export const UpdateVisibilitySchema = z.object({
  visibility: VisibilitySchema,
});

export type UpdateVisibilityInput = z.input<typeof UpdateVisibilitySchema>;
export type UpdateVisibilityOutput = z.infer<typeof UpdateVisibilitySchema>;

export const UpdateSalaryExpectationsSchema = z.object({
  salaryMin: z.number().int().min(0).optional(),
  salaryTarget: z.number().int().min(0).optional(),
  salaryCurrency: SalaryCurrencySchema.optional(),
  salaryPeriod: SalaryPeriodSchema.optional(),
});

export type UpdateSalaryExpectationsInput = z.input<
  typeof UpdateSalaryExpectationsSchema
>;
export type UpdateSalaryExpectationsOutput = z.infer<
  typeof UpdateSalaryExpectationsSchema
>;

export const AddSkillSchema = z.object({
  skillTag: z.string().min(1).max(100),
  proficiency: SkillProficiencySchema,
});

export type AddSkillInput = z.input<typeof AddSkillSchema>;
export type AddSkillOutput = z.infer<typeof AddSkillSchema>;

export const UpdateSkillSchema = z.object({
  skillId: z.uuid(),
  proficiency: SkillProficiencySchema,
});

export type UpdateSkillInput = z.input<typeof UpdateSkillSchema>;
export type UpdateSkillOutput = z.infer<typeof UpdateSkillSchema>;

export const RemoveSkillSchema = z.object({
  skillId: z.uuid(),
});

export type RemoveSkillInput = z.input<typeof RemoveSkillSchema>;
export type RemoveSkillOutput = z.input<typeof RemoveSkillSchema>;

export const AddLanguageSchema = z.object({
  languageCode: z.string().min(2).max(10),
  proficiency: LanguageProficiencySchema,
});

export type AddLanguageInput = z.input<typeof AddLanguageSchema>;
export type AddLanguageOutput = z.infer<typeof AddLanguageSchema>;

export const RemoveLanguageSchema = z.object({
  languageId: z.uuid(),
});

export type RemoveLanguageInput = z.input<typeof RemoveLanguageSchema>;
export type RemoveLanguageOutput = z.infer<typeof RemoveLanguageSchema>;

export const AddCertificationSchema = z.object({
  name: z.string().min(1).max(200),
  issuingOrg: z.string().max(200).optional(),
  issueDate: z.iso.datetime({ offset: true }).optional(),
  expiryDate: z.iso.datetime({ offset: true }).optional(),
});

export type AddCertificationInput = z.input<typeof AddCertificationSchema>;
export type AddCertificationOutput = z.infer<typeof AddCertificationSchema>;

export const UpdateCertificationSchema = z.object({
  certificationId: z.uuid(),
  name: z.string().min(1).max(200).optional(),
  issuingOrg: z.string().max(200).optional(),
  issueDate: z.iso.datetime({ offset: true }).optional(),
  expiryDate: z.iso.datetime({ offset: true }).optional(),
});

export type UpdateCertificationInput = z.input<
  typeof UpdateCertificationSchema
>;
export type UpdateCertificationOutput = z.infer<
  typeof UpdateCertificationSchema
>;

export const RemoveCertificationSchema = z.object({
  certificationId: z.uuid(),
});

export type RemoveCertificationInput = z.input<
  typeof RemoveCertificationSchema
>;
export type RemoveCertificationOutput = z.infer<
  typeof RemoveCertificationSchema
>;

export const UpdatePreferencesSchema = z.object({
  preferredIndustries: z.array(z.string().max(100)).optional(),
  preferredRoles: z.array(z.string().max(100)).optional(),
  preferredLocations: z.array(z.string().max(100)).optional(),
  minCompanySize: z.string().max(20).optional(),
  excludeCompanies: z.array(z.string().max(200)).optional(),
  openToRelocation: z.boolean().optional(),
});

export type UpdatePreferencesInput = z.input<typeof UpdatePreferencesSchema>;
export type UpdatePreferencesOutput = z.infer<typeof UpdatePreferencesSchema>;
