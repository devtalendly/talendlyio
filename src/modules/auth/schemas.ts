import { formOptions } from '@tanstack/react-form';
import { z } from 'zod';

export const EmailSchema = z
  .email('Please enter a valid email.')
  .toLowerCase()
  .trim();

export const PasswordSchema = z
  .string()
  .min(8, 'Be at least 8 characters long')
  .regex(/[a-zA-Z]/, 'Contain at least one letter.')
  .regex(/[0-9]/, 'Contain at least one number.')
  .regex(/[^a-zA-Z0-9]/, 'Contain at least one special character.')
  .trim();

const OtpSchema = z
  .string()
  .length(6, 'OTP must be exactly 6 digits.')
  .regex(/^\d+$/, 'OTP must contain only numbers.');

export const SignUpFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.').trim(),
  email: EmailSchema,
  password: PasswordSchema,
});

export type SignUpFormInput = z.input<typeof SignUpFormSchema>;
export type SignUpFormOutput = z.infer<typeof SignUpFormSchema>;

export const signUpFormOptions = formOptions({
  defaultValues: {
    name: '',
    email: '',
    password: '',
  },
});

export const SignInFormSchema = z.object({
  email: EmailSchema,
  password: z.string().min(8, 'Be at least 8 characters long').trim(),
});

export type SignInFormInput = z.input<typeof SignInFormSchema>;
export type SignInFormOutput = z.infer<typeof SignInFormSchema>;

export const signInFormOptions = formOptions({
  defaultValues: {
    email: '',
    password: '',
  },
});

export const VerifyEmailFormSchema = z.object({
  email: EmailSchema,
  otp: OtpSchema,
});

export type VerifyEmailFormInput = z.input<typeof VerifyEmailFormSchema>;
export type VerifyEmailFormOutput = z.infer<typeof VerifyEmailFormSchema>;

export const verifyEmailFormOptions = formOptions({
  defaultValues: {
    email: '',
    otp: '',
  },
});

export const ForgotPasswordFormSchema = z.object({
  email: EmailSchema,
});

export type ForgotPasswordFormInput = z.input<typeof ForgotPasswordFormSchema>;
export type ForgotPasswordFormOutput = z.infer<typeof ForgotPasswordFormSchema>;

export const forgotPasswordFormOptions = formOptions({
  defaultValues: {
    email: '',
  },
});

export const ResetPasswordFormSchema = z
  .object({
    email: EmailSchema,
    otp: OtpSchema,
    newPassword: PasswordSchema,
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormInput = z.input<typeof ResetPasswordFormSchema>;
export type ResetPasswordFormOutput = z.infer<typeof ResetPasswordFormSchema>;

export const resetPasswordFormOptions = formOptions({
  defaultValues: {
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  },
});
