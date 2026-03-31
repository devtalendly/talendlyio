import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { emailOTP, organization, admin } from 'better-auth/plugins';

import { db } from '@/lib/db';
import * as schema from '@/server/database/schema';
import { runWithDatabase } from '@/server/async-hooks/db';
import { createUserProfile } from '@/modules/users/services/user-profile.service';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  plugins: [
    admin(),
    emailOTP({
      sendVerificationOnSignUp: true,
      async sendVerificationOTP(data) {
        if (data.type === 'email-verification') {
          // TODO: replace with real email provider
          console.log(
            `[email-verification] To: ${data.email} | OTP: ${data.otp}`,
          );
        } else if (data.type === 'forget-password') {
          // TODO: replace with real email provider
          console.log(`[password-reset] To: ${data.email} | OTP: ${data.otp}`);
        } else {
          throw new Error(`Unsupported OTP type: ${data.type}`);
        }
      },
    }),
    organization(),
    nextCookies(),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await runWithDatabase(db, () => createUserProfile(user.id));
        },
      },
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
});

export type Auth = typeof auth;

type SessionPayload = Auth['$Infer']['Session'];
export type AuthSession = SessionPayload['session'];
export type AuthUser = SessionPayload['user'];
