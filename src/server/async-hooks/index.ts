import type { AsyncLocalStorage } from 'node:async_hooks';

export type { AsyncLocalStorage };

const AsyncLocalStoragePromise: Promise<typeof AsyncLocalStorage | null> =
  import('node:async_hooks')
    .then((mod) => mod.AsyncLocalStorage)
    .catch((err) => {
      if ('AsyncLocalStorage' in globalThis) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (globalThis as any).AsyncLocalStorage;
      }
      if (typeof window !== 'undefined') {
        return null;
      }
      console.warn(
        'Warning: AsyncLocalStorage is not available in this environment. Some features may not work as expected.',
      );
      throw err;
    });

export async function getAsyncLocalStorage(): Promise<
  typeof AsyncLocalStorage
> {
  const mod = await AsyncLocalStoragePromise;
  if (mod === null) {
    throw new Error('getAsyncLocalStorage is only available in server code');
  } else {
    return mod;
  }
}
