'use server';

import { authenticatedAction } from '@/internals/action/auth';
import { db } from '@/lib/db';
import { runWithDatabase } from '@/server/async-hooks/db';
import {
  addSkill,
  removeSkill,
  updateSkill,
} from '@/modules/candidates/services/skills';
import {
  AddSkillSchema,
  RemoveSkillSchema,
  UpdateSkillSchema,
} from '@/modules/candidates/schemas';

export const addSkillAction = authenticatedAction()
  .input(AddSkillSchema)
  .handler(async (payload, { user }) => {
    return runWithDatabase(db, () => addSkill(user.id, payload));
  })
  .asAction();

export const updateSkillAction = authenticatedAction()
  .input(UpdateSkillSchema)
  .handler(async ({ skillId, proficiency }, { user }) => {
    return runWithDatabase(db, () =>
      updateSkill(user.id, skillId, proficiency),
    );
  })
  .asAction();

export const removeSkillAction = authenticatedAction()
  .input(RemoveSkillSchema)
  .handler(async ({ skillId }, { user }) => {
    return runWithDatabase(db, () => removeSkill(user.id, skillId));
  })
  .asAction();
