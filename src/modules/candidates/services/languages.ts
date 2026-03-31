import { and, eq } from 'drizzle-orm';

import { createException } from '@/internals/exceptions';
import { getDatabaseFromContext } from '@/server/async-hooks/db';
import {
  candidateLanguages,
  candidateProfiles,
} from '@/server/database/schema';
import type {
  CandidateLanguage,
  CandidateLanguageInsert,
} from '@/server/database/types';
import { recalculateProfileStrength } from './profile';

export async function addLanguage(
  userId: string,
  data: Pick<CandidateLanguageInsert, 'languageCode' | 'proficiency'>,
): Promise<CandidateLanguage> {
  const db = await getDatabaseFromContext();

  const [profile] = await db
    .select({ id: candidateProfiles.id })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId));

  if (!profile) {
    throw new createException.NotFound('Candidate profile not found');
  }

  const [language] = await db
    .insert(candidateLanguages)
    .values({ ...data, candidateProfileId: profile.id })
    .returning();

  if (!language) {
    throw new createException.UnprocessableEntity('Failed to add language');
  }

  await recalculateProfileStrength(profile.id);
  return language;
}

export async function removeLanguage(
  userId: string,
  languageId: string,
): Promise<void> {
  const db = await getDatabaseFromContext();

  const [profile] = await db
    .select({ id: candidateProfiles.id })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId));

  if (!profile) {
    throw new createException.NotFound('Candidate profile not found');
  }

  const [deleted] = await db
    .delete(candidateLanguages)
    .where(
      and(
        eq(candidateLanguages.id, languageId),
        eq(candidateLanguages.candidateProfileId, profile.id),
      ),
    )
    .returning({ id: candidateLanguages.id });

  if (!deleted) {
    throw new createException.NotFound('Language not found');
  }

  await recalculateProfileStrength(profile.id);
}
