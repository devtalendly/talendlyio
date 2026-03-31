import { eq } from 'drizzle-orm';

import { getDatabaseFromContext } from '@/server/async-hooks/db';
import { users } from '@/server/database/schema';
import type { UserInsert } from '@/server/database/types';

export async function updateUser(
  userId: string,
  data: Pick<
    UserInsert,
    'locale' | 'isActive' | 'lastLoginAt' | 'onboardingCompleted'
  >,
) {
  const db = await getDatabaseFromContext();
  const [user] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, userId))
    .returning();
  return user ?? null;
}
