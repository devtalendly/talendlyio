'use client';

import { useForm } from '@tanstack/react-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  ForgotPasswordFormSchema,
  forgotPasswordFormOptions,
} from '@/modules/auth/schemas';

export function ForgotPasswordForm(props: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const form = useForm({
    ...forgotPasswordFormOptions,
    validators: { onSubmit: ForgotPasswordFormSchema },
    async onSubmit({ value }) {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: value.email,
        type: 'forget-password',
      });
      if (error) {
        // TODO: Handle error (e.g., show a toast notification)
        alert(
          error.message ??
            'An error occurred while sending the reset code. Please try again.',
        );
      } else {
        router.push(`/reset-password?email=${encodeURIComponent(value.email)}`);
      }
    },
  });

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset code.
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
          <FieldGroup>
            <form.Field name="email">
              {(field) => (
                <Field data-invalid={isInvalid(field)}>
                  <FieldLabel htmlFor={getFieldId(field)}>Email</FieldLabel>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
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
                  {isSubmitting ? 'Sending…' : 'Send reset code'}
                </Button>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
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
