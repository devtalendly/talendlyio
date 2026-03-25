import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { emailOTP, organization } from 'better-auth/plugins';

import { db } from '@/lib/db';
import * as schema from '@/server/database/schema';

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
