import { type AppException, normalizeError } from '@/internals/exceptions';

export type Ok<T> = { success: true; data: T };
export type Err = { success: false; error: AppException };
export type Result<T> = Ok<T> | Err;

export function ok<T>(value: T): Ok<T>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ok<T extends void = void>(value: void): Ok<void>;
export function ok<T>(value: T): Ok<T> {
  return { success: true, data: value };
}

export function err<E = unknown>(err: E): Err {
  return { success: false, error: normalizeError(err) };
}
