import { AppException, normalizeError } from './exceptions';
import { isPromise } from './guards';

export type TryAsyncResult<T> = [null, T] | [AppException, null];

type FnOrPromise<T> = Promise<T> | (() => Promise<T>);

export async function tryAsync<T>(
  fnOrPromise: FnOrPromise<T>,
): Promise<TryAsyncResult<T>> {
  try {
    const result = isPromise<T>(fnOrPromise)
      ? await fnOrPromise
      : await fnOrPromise();

    return [null, result];
  } catch (error) {
    return [normalizeError(error), null];
  }
}
