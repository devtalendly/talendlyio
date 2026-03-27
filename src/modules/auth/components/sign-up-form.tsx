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
import { signUp } from '@/lib/auth-client';
import { SignUpFormSchema, signUpFormOptions } from '@/modules/auth/schemas';

export function SignUpForm(props: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const form = useForm({
    ...signUpFormOptions,
    validators: { onSubmit: SignUpFormSchema },
    async onSubmit({ value }) {
      const { error } = await signUp.email({
        name: value.name,
        email: value.email,
        password: value.password,
        callbackURL: '/',
      });
      if (error) {
        // TODO: Handle error (e.g., show a toast notification)
        alert(
          error.message ??
            'An error occurred while creating your account. Please try again.',
        );
      } else {
        router.push(`/verify-email?email=${encodeURIComponent(value.email)}`);
      }
    },
  });

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your details below to get started.
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
            <form.Field name="name">
              {(field) => (
                <Field data-invalid={isInvalid(field)}>
                  <FieldLabel htmlFor={getFieldId(field)}>Name</FieldLabel>
                  <Input
                    type="text"
                    placeholder="Jane Doe"
                    autoComplete="name"
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
            <form.Field name="password">
              {(field) => (
                <Field data-invalid={isInvalid(field)}>
                  <FieldLabel htmlFor={getFieldId(field)}>Password</FieldLabel>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
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
                  {isSubmitting ? 'Creating account…' : 'Create account'}
                </Button>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground text-sm">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
