'use server';

import { authenticatedAction } from '@/internals/action/auth';
import { db } from '@/lib/db';
import {
  AddCertificationSchema,
  RemoveCertificationSchema,
  UpdateCertificationSchema,
} from '@/modules/candidates/schemas';
import {
  addCertification,
  removeCertification,
  updateCertification,
} from '@/modules/candidates/services/certifications';
import { runWithDatabase } from '@/server/async-hooks/db';

export const addCertificationAction = authenticatedAction()
  .input(AddCertificationSchema)
  .handler(async ({ issueDate, expiryDate, ...rest }, { user }) => {
    return runWithDatabase(db, () =>
      addCertification(user.id, {
        ...rest,
        issueDate: issueDate ? new Date(issueDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      }),
    );
  })
  .asStateAction();

export const updateCertificationAction = authenticatedAction()
  .input(UpdateCertificationSchema)
  .handler(
    async ({ certificationId, issueDate, expiryDate, ...rest }, { user }) => {
      return runWithDatabase(db, () =>
        updateCertification(user.id, certificationId, {
          ...rest,
          issueDate: issueDate ? new Date(issueDate) : undefined,
          expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        }),
      );
    },
  )
  .asStateAction();

export const removeCertificationAction = authenticatedAction()
  .input(RemoveCertificationSchema)
  .handler(async ({ certificationId }, { user }) => {
    return runWithDatabase(db, () =>
      removeCertification(user.id, certificationId),
    );
  })
  .asStateAction();
