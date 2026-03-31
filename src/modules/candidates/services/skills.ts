import { and, eq } from 'drizzle-orm';

import { createException } from '@/internals/exceptions';
import { getDatabaseFromContext } from '@/server/async-hooks/db';
import { candidateProfiles, candidateSkills } from '@/server/database/schema';
import type {
  CandidateSkill,
  CandidateSkillInsert,
} from '@/server/database/types';
import { recalculateProfileStrength } from './profile';

const MAX_SKILLS = 25;

export async function addSkill(
  userId: string,
  data: Pick<CandidateSkillInsert, 'skillTag' | 'proficiency'>,
): Promise<CandidateSkill> {
  const db = await getDatabaseFromContext();

  const [profile] = await db
    .select({ id: candidateProfiles.id })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId));

  if (!profile) {
    throw new createException.NotFound('Candidate profile not found');
  }

  const existingSkills = await db
    .select({ id: candidateSkills.id })
    .from(candidateSkills)
    .where(eq(candidateSkills.candidateProfileId, profile.id));

  if (existingSkills.length >= MAX_SKILLS) {
    throw new createException.BadRequest(
      `Maximum of ${MAX_SKILLS} skills allowed`,
    );
  }

  const [skill] = await db
    .insert(candidateSkills)
    .values({ ...data, candidateProfileId: profile.id })
    .returning();

  if (!skill) {
    throw new createException.UnprocessableEntity('Failed to add skill');
  }

  await recalculateProfileStrength(profile.id);
  return skill;
}

export async function updateSkill(
  userId: string,
  skillId: string,
  proficiency: CandidateSkillInsert['proficiency'],
): Promise<CandidateSkill> {
  const db = await getDatabaseFromContext();

  const [profile] = await db
    .select({ id: candidateProfiles.id })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId));

  if (!profile) {
    throw new createException.NotFound('Candidate profile not found');
  }

  const [skill] = await db
    .update(candidateSkills)
    .set({ proficiency })
    .where(
      and(
        eq(candidateSkills.id, skillId),
        eq(candidateSkills.candidateProfileId, profile.id),
      ),
    )
    .returning();

  if (!skill) {
    throw new createException.NotFound('Skill not found');
  }

  return skill;
}

export async function removeSkill(
  userId: string,
  skillId: string,
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
    .delete(candidateSkills)
    .where(
      and(
        eq(candidateSkills.id, skillId),
        eq(candidateSkills.candidateProfileId, profile.id),
      ),
    )
    .returning({ id: candidateSkills.id });

  if (!deleted) {
    throw new createException.NotFound('Skill not found');
  }

  await recalculateProfileStrength(profile.id);
}
