import { eq } from 'drizzle-orm';

import { createException } from '@/internals/exceptions';
import { getDatabaseFromContext } from '@/server/async-hooks/db';
import {
  candidatePreferences,
  candidateProfiles,
} from '@/server/database/schema';
import type {
  CandidatePreferences,
  CandidatePreferencesInsert,
} from '@/server/database/types';
import type { Prettify } from '@/lib/types';

type PreferencesData = Prettify<
  Omit<
    CandidatePreferencesInsert,
    'id' | 'candidateProfileId' | 'createdAt' | 'updatedAt'
  >
>;

export async function upsertPreferences(
  userId: string,
  data: PreferencesData,
): Promise<CandidatePreferences> {
  const db = await getDatabaseFromContext();

  const [profile] = await db
    .select({ id: candidateProfiles.id })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId));

  if (!profile) {
    throw new createException.NotFound('Candidate profile not found');
  }

  const [preferences] = await db
    .insert(candidatePreferences)
    .values({ ...data, candidateProfileId: profile.id })
    .onConflictDoUpdate({
      target: candidatePreferences.candidateProfileId,
      set: data,
    })
    .returning();

  if (!preferences) {
    throw new createException.UnprocessableEntity(
      'Failed to update preferences',
    );
  }

  return preferences;
}
