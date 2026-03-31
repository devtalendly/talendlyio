import {
  accounts,
  candidateCertifications,
  candidateLanguages,
  candidatePreferences,
  candidateProfiles,
  candidateSkills,
  invitations,
  members,
  organizations,
  sessions,
  users,
  verifications,
} from './schema';

export type Account = typeof accounts.$inferSelect;
export type AccountInsert = typeof accounts.$inferInsert;

export type Invitation = typeof invitations.$inferSelect;
export type InvitationInsert = typeof invitations.$inferInsert;

export type Member = typeof members.$inferSelect;
export type MemberInsert = typeof members.$inferInsert;

export type Organization = typeof organizations.$inferSelect;
export type OrganizationInsert = typeof organizations.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type SessionInsert = typeof sessions.$inferInsert;

export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export type Verification = typeof verifications.$inferSelect;
export type VerificationInsert = typeof verifications.$inferInsert;

export type CandidateProfile = typeof candidateProfiles.$inferSelect;
export type CandidateProfileInsert = typeof candidateProfiles.$inferInsert;

export type CandidateSkill = typeof candidateSkills.$inferSelect;
export type CandidateSkillInsert = typeof candidateSkills.$inferInsert;

export type CandidateLanguage = typeof candidateLanguages.$inferSelect;
export type CandidateLanguageInsert = typeof candidateLanguages.$inferInsert;

export type CandidateCertification = typeof candidateCertifications.$inferSelect;
export type CandidateCertificationInsert = typeof candidateCertifications.$inferInsert;

export type CandidatePreferences = typeof candidatePreferences.$inferSelect;
export type CandidatePreferencesInsert = typeof candidatePreferences.$inferInsert;
