'use client';

import { useForm } from '@tanstack/react-form';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

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
import {
  getFieldErrorId,
  getFieldId,
  getInputProps,
  isInvalid,
} from '@/internals/form/props';
import { authClient } from '@/lib/auth-client';
import {
  ResetPasswordFormSchema,
  resetPasswordFormOptions,
} from '@/modules/auth/schemas';
import { ResendOtpButton } from './resend-otp-button';

export function ResetPasswordForm(props: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resendSuccess, setResendSuccess] = useState(false);
  const form = useForm({
    ...resetPasswordFormOptions,
    validators: { onSubmit: ResetPasswordFormSchema },
    async onSubmit({ value }) {
      const { error } = await authClient.emailOtp.resetPassword({
        email: value.email,
        otp: value.otp,
        password: value.newPassword,
      });
      if (error) {
        // TODO: Handle error (e.g., show a toast notification)
        alert(
          error.message ??
            'An error occurred while resetting your password. The code may have expired.',
        );
      } else {
        router.push('/sign-in');
      }
    },
  });

  const email = searchParams.get('email') ?? '';

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
        <form
          id={form.formId}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit(e);
          }}
        >
          <form.Field name="email">
            {(field) => (
              <Input type="hidden" name={field.name} value={email} readOnly />
            )}
          </form.Field>
          <FieldGroup>
            <form.Field name="otp">
              {(field) => (
                <Field data-invalid={isInvalid(field)}>
                  <FieldLabel htmlFor={getFieldId(field)}>
                    Reset code
                  </FieldLabel>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    {...getInputProps(field)}
                    onChange={(e) =>
                      field.handleChange(e.target.value.replace(/\D/g, ''))
                    }
                  />
                  {isInvalid(field) && (
                    <FieldError
                      id={getFieldErrorId(field)}
                      errors={field.state.meta.errors}
                    />
                  )}
                </Field>
              )}
            </form.Field>
            <form.Field name="newPassword">
              {(field) => (
                <Field data-invalid={isInvalid(field)}>
                  <FieldLabel htmlFor={getFieldId(field)}>
                    New Password
                  </FieldLabel>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    {...getInputProps(field)}
                  />
                  {isInvalid(field) && (
                    <FieldError
                      id={getFieldErrorId(field)}
                      errors={field.state.meta.errors}
                    />
                  )}
                </Field>
              )}
            </form.Field>
            <form.Field name="confirmPassword">
              {(field) => (
                <Field data-invalid={isInvalid(field)}>
                  <FieldLabel htmlFor={getFieldId(field)}>
                    Confirm password
                  </FieldLabel>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    {...getInputProps(field)}
                  />
                  {isInvalid(field) && (
                    <FieldError
                      id={getFieldErrorId(field)}
                      errors={field.state.meta.errors}
                    />
                  )}
                </Field>
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? 'Resetting…' : 'Reset password'}
                </Button>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground text-sm">
          Didn&apos;t receive a code?{' '}
          <ResendOtpButton
            email={email}
            onSuccess={() => setResendSuccess(true)}
          />
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
