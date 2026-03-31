import { defineRelations } from 'drizzle-orm';

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

export const relations = defineRelations(
  {
    users,
    sessions,
    accounts,
    organizations,
    members,
    invitations,
    verifications,
    candidateProfiles,
    candidateSkills,
    candidateLanguages,
    candidateCertifications,
    candidatePreferences,
  },
  (r) => ({
    users: {
      sessions: r.many.sessions(),
      accounts: r.many.accounts(),
      members: r.many.members(),
      invitations: r.many.invitations(),
      candidateProfile: r.one.candidateProfiles({
        from: r.users.id,
        to: r.candidateProfiles.userId,
      }),
    },
    candidateProfiles: {
      user: r.one.users({
        from: r.candidateProfiles.userId,
        to: r.users.id,
      }),
      skills: r.many.candidateSkills(),
      languages: r.many.candidateLanguages(),
      certifications: r.many.candidateCertifications(),
      preferences: r.one.candidatePreferences({
        from: r.candidateProfiles.id,
        to: r.candidatePreferences.candidateProfileId,
      }),
    },
    candidateSkills: {
      profile: r.one.candidateProfiles({
        from: r.candidateSkills.candidateProfileId,
        to: r.candidateProfiles.id,
      }),
    },
    candidateLanguages: {
      profile: r.one.candidateProfiles({
        from: r.candidateLanguages.candidateProfileId,
        to: r.candidateProfiles.id,
      }),
    },
    candidateCertifications: {
      profile: r.one.candidateProfiles({
        from: r.candidateCertifications.candidateProfileId,
        to: r.candidateProfiles.id,
      }),
    },
    candidatePreferences: {
      profile: r.one.candidateProfiles({
        from: r.candidatePreferences.candidateProfileId,
        to: r.candidateProfiles.id,
      }),
    },
    sessions: {
      users: r.one.users({
        from: r.sessions.userId,
        to: r.users.id,
      }),
    },
    accounts: {
      users: r.one.users({
        from: r.accounts.userId,
        to: r.users.id,
      }),
    },
    organizations: {
      members: r.many.members(),
      invitations: r.many.invitations(),
    },
    members: {
      organizations: r.one.organizations({
        from: r.members.organizationId,
        to: r.organizations.id,
      }),
      users: r.one.users({
        from: r.members.userId,
        to: r.users.id,
      }),
    },
    invitations: {
      organizations: r.one.organizations({
        from: r.invitations.organizationId,
        to: r.organizations.id,
      }),
      users: r.one.users({
        from: r.invitations.inviterId,
        to: r.users.id,
      }),
    },
  }),
);
