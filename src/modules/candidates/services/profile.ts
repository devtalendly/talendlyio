import { randomBytes } from 'node:crypto';
import { and, eq } from 'drizzle-orm';

import { createException } from '@/internals/exceptions';
import { getDatabaseFromContext } from '@/server/async-hooks/db';
import {
  candidateCertifications,
  candidateLanguages,
  candidateProfiles,
  candidateSkills,
} from '@/server/database/schema';
import type {
  CandidateProfile,
  CandidateProfileInsert,
} from '@/server/database/types';
import { calculateProfileStrength } from './strength';

type CreateCandidateProfileData = Omit<
  CandidateProfileInsert,
  | 'id'
  | 'userId'
  | 'publicId'
  | 'isVerified'
  | 'profileStrength'
  | 'createdAt'
  | 'updatedAt'
>;

type UpdateCandidateProfileData = Partial<
  Omit<
    CandidateProfileInsert,
    | 'id'
    | 'userId'
    | 'publicId'
    | 'isVerified'
    | 'profileStrength'
    | 'createdAt'
    | 'updatedAt'
  >
>;

function generatePublicId(): string {
  return `TL-${randomBytes(3).toString('hex')}`;
}

export async function createCandidateProfile(
  userId: string,
  data: CreateCandidateProfileData = {},
): Promise<CandidateProfile> {
  const db = await getDatabaseFromContext();

  let profile: CandidateProfile | undefined;

  // Retry on public_id collision (astronomically rare but safe)
  for (let attempt = 0; attempt < 5; attempt++) {
    const publicId = generatePublicId();
    const [existing] = await db
      .select({ id: candidateProfiles.id })
      .from(candidateProfiles)
      .where(eq(candidateProfiles.publicId, publicId))
      .limit(1);

    if (existing) continue;

    [profile] = await db
      .insert(candidateProfiles)
      .values({ ...data, userId, publicId })
      .returning();
    break;
  }

  if (!profile) {
    throw new createException.UnprocessableEntity(
      'Failed to create candidate profile',
      {
        context: { userId },
      },
    );
  }

  return profile;
}

export async function getCandidateProfileByUserId(
  userId: string,
): Promise<CandidateProfile | null> {
  const db = await getDatabaseFromContext();
  const [profile] = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId));
  return profile ?? null;
}

export async function getCandidateProfileById(
  profileId: string,
): Promise<CandidateProfile | null> {
  const db = await getDatabaseFromContext();
  const [profile] = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.id, profileId));
  return profile ?? null;
}

export async function updateCandidateProfile(
  userId: string,
  data: UpdateCandidateProfileData,
): Promise<CandidateProfile> {
  const db = await getDatabaseFromContext();

  const [profile] = await db
    .update(candidateProfiles)
    .set(data)
    .where(eq(candidateProfiles.userId, userId))
    .returning();

  if (!profile) {
    throw new createException.NotFound('Candidate profile not found');
  }

  await recalculateProfileStrength(profile.id);
  return profile;
}

export async function updateVisibility(
  userId: string,
  visibility: CandidateProfile['visibility'],
): Promise<CandidateProfile> {
  const db = await getDatabaseFromContext();
  const [profile] = await db
    .update(candidateProfiles)
    .set({ visibility })
    .where(eq(candidateProfiles.userId, userId))
    .returning();

  if (!profile) {
    throw new createException.NotFound('Candidate profile not found');
  }

  return profile;
}

export async function updateSalaryExpectations(
  userId: string,
  data: Pick<
    CandidateProfileInsert,
    'salaryMin' | 'salaryTarget' | 'salaryCurrency' | 'salaryPeriod'
  >,
): Promise<CandidateProfile> {
  const db = await getDatabaseFromContext();
  const [profile] = await db
    .update(candidateProfiles)
    .set(data)
    .where(eq(candidateProfiles.userId, userId))
    .returning();

  if (!profile) {
    throw new createException.NotFound('Candidate profile not found');
  }

  await recalculateProfileStrength(profile.id);
  return profile;
}

export async function updateLastActive(profileId: string): Promise<void> {
  const db = await getDatabaseFromContext();
  await db
    .update(candidateProfiles)
    .set({ lastActiveAt: new Date() })
    .where(eq(candidateProfiles.id, profileId));
}

export async function recalculateProfileStrength(
  profileId: string,
): Promise<number> {
  const db = await getDatabaseFromContext();

  const [[profile], skills, languages, certs] = await Promise.all([
    db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.id, profileId)),
    db
      .select({ id: candidateSkills.id })
      .from(candidateSkills)
      .where(and(eq(candidateSkills.candidateProfileId, profileId))),
    db
      .select({ id: candidateLanguages.id })
      .from(candidateLanguages)
      .where(eq(candidateLanguages.candidateProfileId, profileId)),
    db
      .select({ id: candidateCertifications.id })
      .from(candidateCertifications)
      .where(eq(candidateCertifications.candidateProfileId, profileId)),
  ]);

  if (!profile) return 0;

  const strength = calculateProfileStrength(profile, skills, languages, certs);

  await db
    .update(candidateProfiles)
    .set({ profileStrength: strength })
    .where(eq(candidateProfiles.id, profileId));

  return strength;
}
