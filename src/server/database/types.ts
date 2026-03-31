import {
  accounts,
  invitations,
  members,
  organizations,
  sessions,
  userProfiles,
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

export type UserProfile = typeof userProfiles.$inferSelect;
export type UserProfileInsert = typeof userProfiles.$inferInsert;

export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export type Verification = typeof verifications.$inferSelect;
export type VerificationInsert = typeof verifications.$inferInsert;
