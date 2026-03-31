import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { cache } from 'react';

async function getSessionData() {
  const sessionData = await auth.api.getSession({ headers: await headers() });
  return sessionData;
}

export const getAuth = cache(async () => {
  const sessionData = await getSessionData();
  return sessionData;
});

export const currentSession = cache(async () => {
  const sessionData = await getSessionData();
  return sessionData?.session ?? null;
});

export const currentUser = cache(async () => {
  const sessionData = await getSessionData();
  return sessionData?.user ?? null;
});

export const isAuthenticated = cache(async () => {
  const sessionData = await getSessionData();
  return sessionData !== null;
});
