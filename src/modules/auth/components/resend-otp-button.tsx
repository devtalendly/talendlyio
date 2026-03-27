'use client';

import { useTransition } from 'react';

import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

export function ResendOtpButton({
  email,
  onError,
  onSuccess,
  className,
  onClick,
  ...props
}: Omit<React.ComponentProps<'button'>, 'onError'> & {
  email: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleResend(e: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(e);
    startTransition(async () => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'email-verification',
      });
      if (error) {
        onError?.(
          error.message ??
            'An error occurred while resending the OTP. Please try again.',
        );
      } else {
        onSuccess?.();
      }
    });
  }

  return (
    <button
      {...props}
      type="button"
      onClick={handleResend}
      disabled={isPending || props.disabled}
      className={cn(
        'text-foreground hover:underline disabled:opacity-50',
        className,
      )}
    >
      {isPending ? 'Sending…' : 'Resend'}
    </button>
  );
}
