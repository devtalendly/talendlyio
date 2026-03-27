'use client';

import { useForm } from '@tanstack/react-form';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

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
  VerifyEmailFormSchema,
  verifyEmailFormOptions,
} from '@/modules/auth/schemas';
import { ResendOtpButton } from './resend-otp-button';

export function VerifyEmailForm(props: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [resendSuccess, setResendSuccess] = useState(false);
  const form = useForm({
    ...verifyEmailFormOptions,
    defaultValues: {
      ...verifyEmailFormOptions.defaultValues,
      email,
    },
    validators: { onSubmit: VerifyEmailFormSchema },
    async onSubmit({ value, formApi }) {
      const { error } = await authClient.emailOtp.verifyEmail({
        email: value.email,
        otp: value.otp,
      });
      if (error) {
        toast.error(
          error.message ??
            'An error occurred while verifying your email. Please try again.',
        );
      } else {
        formApi.reset();
        router.push('/');
      }
    },
  });

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
              <Input
                type="hidden"
                name={field.name}
                defaultValue={email}
                readOnly
              />
            )}
          </form.Field>
          <FieldGroup>
            <form.Field name="otp">
              {(field) => (
                <Field data-invalid={isInvalid(field)}>
                  <FieldLabel htmlFor={getFieldId(field)}>
                    Verification code
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

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? 'Verifying…' : 'Verify email'}
                </Button>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          Didn&apos;t receive a code?{' '}
          <ResendOtpButton
            email={email}
            onSuccess={() => setResendSuccess(true)}
            onError={(err) => toast.error(err)}
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
