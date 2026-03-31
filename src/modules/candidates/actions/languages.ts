'use server';

import { authenticatedAction } from '@/internals/action/auth';
import { db } from '@/lib/db';
import {
  AddLanguageSchema,
  RemoveLanguageSchema,
} from '@/modules/candidates/schemas';
import {
  addLanguage,
  removeLanguage,
} from '@/modules/candidates/services/languages';
import { runWithDatabase } from '@/server/async-hooks/db';

export const addLanguageAction = authenticatedAction()
  .input(AddLanguageSchema)
  .handler(async (payload, { user }) => {
    return runWithDatabase(db, () => addLanguage(user.id, payload));
  })
  .asAction();

export const removeLanguageAction = authenticatedAction()
  .input(RemoveLanguageSchema)
  .handler(async ({ languageId }, { user }) => {
    return runWithDatabase(db, () => removeLanguage(user.id, languageId));
  })
  .asAction();
