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
import { signIn } from '@/lib/auth-client';
import { SignInFormSchema, signInFormOptions } from '@/modules/auth/schemas';

export function SignInForm(props: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const form = useForm({
    ...signInFormOptions,
    validators: { onSubmit: SignInFormSchema },
    async onSubmit({ value }) {
      const { error } = await signIn.email({
        email: value.email,
        password: value.password,
        callbackURL: '/',
      });
      if (error) {
        // TODO: Handle error (e.g., show a toast notification)
        alert(
          error.message ??
            'An error occurred while signing in. Please try again.',
        );
      } else {
        router.push('/');
      }
    },
  });

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Enter your email and password to access your account.
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
            <form.Field name="password">
              {(field) => (
                <Field data-invalid={isInvalid(field)}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={getFieldId(field)}>
                      Password
                    </FieldLabel>
                    <Link
                      href="/forgot-password"
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
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
                  {isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-foreground hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
