'use server';

import { authenticatedAction } from '@/internals/action/auth';
import { db } from '@/lib/db';
import { updateUser } from '@/modules/auth/lib/mutations';
import {
  CreateCandidateProfileSchema,
  UpdateCandidateProfileSchema,
  UpdateSalaryExpectationsSchema,
  UpdateVisibilitySchema,
} from '@/modules/candidates/schemas';
import {
  createCandidateProfile,
  updateCandidateProfile,
  updateSalaryExpectations,
  updateVisibility,
} from '@/modules/candidates/services/profile';
import { runWithDatabase, runWithTransaction } from '@/server/async-hooks/db';

export const createCandidateProfileAction = authenticatedAction()
  .input(CreateCandidateProfileSchema)
  .handler(async (payload, { user }) => {
    return runWithTransaction(db, async () => {
      const profile = await createCandidateProfile(user.id, payload);
      await updateUser(user.id, { onboardingCompleted: true });
      return profile;
    });
  })
  .asAction();

export const updateCandidateProfileAction = authenticatedAction()
  .input(UpdateCandidateProfileSchema)
  .handler(async (payload, { user }) => {
    return runWithDatabase(db, () => updateCandidateProfile(user.id, payload));
  })
  .asAction();

export const updateVisibilityAction = authenticatedAction()
  .input(UpdateVisibilitySchema)
  .handler(async ({ visibility }, { user }) => {
    return runWithDatabase(db, () => updateVisibility(user.id, visibility));
  })
  .asAction();

export const updateSalaryExpectationsAction = authenticatedAction()
  .input(UpdateSalaryExpectationsSchema)
  .handler(async (payload, { user }) => {
    return runWithDatabase(db, () =>
      updateSalaryExpectations(user.id, payload),
    );
  })
  .asAction();
