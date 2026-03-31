import { defineRelations } from 'drizzle-orm';

import {
  accounts,
  invitations,
  members,
  organizations,
  sessions,
  users,
  userProfiles,
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
    userProfiles,
  },
  (r) => ({
    users: {
      sessions: r.many.sessions(),
      accounts: r.many.accounts(),
      members: r.many.members(),
      invitations: r.many.invitations(),
      userProfile: r.one.userProfiles({
        from: r.users.id,
        to: r.userProfiles.userId,
      }),
    },
    userProfiles: {
      user: r.one.users({
        from: r.userProfiles.userId,
        to: r.users.id,
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
