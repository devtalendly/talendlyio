import { createAuthClient } from 'better-auth/react';
import {
  organizationClient,
  emailOTPClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';

import type { Auth, AuthSession, AuthUser } from './auth';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  plugins: [
    emailOTPClient(),
    organizationClient(),
    inferAdditionalFields<Auth>(),
  ],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export type { AuthSession, AuthUser };
