import { and, eq } from 'drizzle-orm';

import { createException } from '@/internals/exceptions';
import { getDatabaseFromContext } from '@/server/async-hooks/db';
import {
  candidateCertifications,
  candidateProfiles,
} from '@/server/database/schema';
import type {
  CandidateCertification,
  CandidateCertificationInsert,
} from '@/server/database/types';
import { recalculateProfileStrength } from './profile';

type CertificationData = Pick<
  CandidateCertificationInsert,
  'name' | 'issuingOrg' | 'issueDate' | 'expiryDate'
>;

export async function addCertification(
  userId: string,
  data: CertificationData,
): Promise<CandidateCertification> {
  const db = await getDatabaseFromContext();

  const [profile] = await db
    .select({ id: candidateProfiles.id })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId));

  if (!profile) {
    throw new createException.NotFound('Candidate profile not found');
  }

  const [certification] = await db
    .insert(candidateCertifications)
    .values({ ...data, candidateProfileId: profile.id })
    .returning();

  if (!certification) {
    throw new createException.UnprocessableEntity(
      'Failed to add certification',
    );
  }

  await recalculateProfileStrength(profile.id);
  return certification;
}

export async function updateCertification(
  userId: string,
  certificationId: string,
  data: Partial<CertificationData>,
): Promise<CandidateCertification> {
  const db = await getDatabaseFromContext();

  const [profile] = await db
    .select({ id: candidateProfiles.id })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId));

  if (!profile) {
    throw new createException.NotFound('Candidate profile not found');
  }

  const [certification] = await db
    .update(candidateCertifications)
    .set(data)
    .where(
      and(
        eq(candidateCertifications.id, certificationId),
        eq(candidateCertifications.candidateProfileId, profile.id),
      ),
    )
    .returning();

  if (!certification) {
    throw new createException.NotFound('Certification not found');
  }

  return certification;
}

export async function removeCertification(
  userId: string,
  certificationId: string,
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
    .delete(candidateCertifications)
    .where(
      and(
        eq(candidateCertifications.id, certificationId),
        eq(candidateCertifications.candidateProfileId, profile.id),
      ),
    )
    .returning({ id: candidateCertifications.id });

  if (!deleted) {
    throw new createException.NotFound('Certification not found');
  }

  await recalculateProfileStrength(profile.id);
}
