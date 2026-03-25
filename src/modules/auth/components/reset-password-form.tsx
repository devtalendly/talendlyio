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

export function ResetPasswordForm(props: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const formId = useId();
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!email) {
      setError('Missing email. Please restart the reset flow.');
      return;
    }
    startTransition(async () => {
      const { error } = await authClient.emailOtp.resetPassword({
        email,
        otp,
        password,
      });
      if (error) {
        setError(error.message ?? 'Reset failed. The code may have expired.');
      } else {
        router.push('/sign-in');
      }
    });
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to{' '}
          <strong>{email || 'your email'}</strong> and choose a new password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id={formId} onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`${formId}-otp`}>Reset code</FieldLabel>
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
            <Field>
              <FieldLabel htmlFor={`${formId}-password`}>
                New password
              </FieldLabel>
              <Input
                id={`${formId}-password`}
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${formId}-confirm`}>
                Confirm password
              </FieldLabel>
              <Input
                id={`${formId}-confirm`}
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
          {isPending ? 'Resetting…' : 'Reset password'}
        </Button>
        <Link
          href="/forgot-password"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Request a new code
        </Link>
      </CardFooter>
    </Card>
  );
}
