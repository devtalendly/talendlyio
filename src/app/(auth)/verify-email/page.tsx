import { Suspense } from 'react';

import { VerifyEmailForm } from '@/modules/auth/components/verify-email-form';

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm className="w-full max-w-sm" />
    </Suspense>
  );
}
