'use server';

import { authenticatedAction } from '@/internals/action/auth';
import { db } from '@/lib/db';
import { UpdatePreferencesSchema } from '@/modules/candidates/schemas';
import { upsertPreferences } from '@/modules/candidates/services/preferences';
import { runWithDatabase } from '@/server/async-hooks/db';

export const updatePreferencesAction = authenticatedAction()
  .input(UpdatePreferencesSchema)
  .handler(async (payload, { user }) => {
    return runWithDatabase(db, () => upsertPreferences(user.id, payload));
  })
  .asAction();
