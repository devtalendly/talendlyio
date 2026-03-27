import { createAuthClient } from 'better-auth/react';
import {
  adminClient,
  organizationClient,
  emailOTPClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';

import type { Auth, AuthSession, AuthUser } from './auth';
import { env } from '@/config/env';

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SITE_URL,
  plugins: [
    adminClient(),
    emailOTPClient(),
    organizationClient(),
    inferAdditionalFields<Auth>(),
  ],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export type { AuthSession, AuthUser };
