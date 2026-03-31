import { eq } from 'drizzle-orm';

import { createException } from '@/internals/exceptions';
import { getDatabaseFromContext } from '@/server/async-hooks/db';
import { userProfiles } from '@/server/database/schema';
import type { UserProfileInsert } from '@/server/database/types';

export async function createUserProfile(userId: string) {
  const db = await getDatabaseFromContext();
  const [profile] = await db
    .insert(userProfiles)
    .values({ userId })
    .returning();

  if (!profile) {
    throw new createException.UnprocessableEntity(
      'Failed to create user profile',
      { context: { userId } },
    );
  }

  return profile;
}

export async function getUserProfile(userId: string) {
  const db = await getDatabaseFromContext();
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));
  return profile ?? null;
}

export async function updateUserProfile(
  userId: string,
  data: Pick<UserProfileInsert, 'locale' | 'isActive' | 'lastLoginAt'>,
) {
  const db = await getDatabaseFromContext();
  const [profile] = await db
    .update(userProfiles)
    .set(data)
    .where(eq(userProfiles.userId, userId))
    .returning();
  return profile ?? null;
}
