'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useId, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';

export function VerifyEmailForm(props: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const formId = useId();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isResendPending, startResendTransition] = useTransition();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const { error } = await authClient.emailOtp.verifyEmail({ email, otp });
      if (error) {
        setError(error.message ?? 'Invalid code. Please try again.');
      } else {
        router.push('/dashboard');
      }
    });
  }

  function handleResend() {
    setResendSuccess(false);
    startResendTransition(async () => {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'email-verification',
      });
      setResendSuccess(true);
    });
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          We sent a 6-digit code to <strong>{email || 'your email'}</strong>.
          Enter it below to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id={formId} onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`${formId}-otp`}>
                Verification code
              </FieldLabel>
              <Input
                id={`${formId}-otp`}
                type="text"
                inputMode="numeric"
                placeholder="123456"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </Field>
            {error && <FieldError>{error}</FieldError>}
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button
          type="submit"
          form={formId}
          className="w-full"
          disabled={isPending || !email}
        >
          {isPending ? 'Verifying…' : 'Verify email'}
        </Button>
        <p className="text-muted-foreground text-sm">
          Didn&apos;t receive a code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResendPending}
            className="text-foreground hover:underline disabled:opacity-50"
          >
            {isResendPending ? 'Sending…' : 'Resend'}
          </button>
          {resendSuccess && (
            <span className="text-muted-foreground"> — sent!</span>
          )}
        </p>
        <Link
          href="/sign-in"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
