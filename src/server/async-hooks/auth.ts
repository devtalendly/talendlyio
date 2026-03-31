import type { AuthUser } from '@/lib/auth';
import { __getTalendlyGlobal } from './global';
import { getAsyncLocalStorage, type AsyncLocalStorage } from './index';

type AuthContext = { user: AuthUser };

async function ensureAsyncStorage() {
  const talendlyGlobal = __getTalendlyGlobal();
  if (!talendlyGlobal.authAsyncStorage) {
    const AsyncLocalStorage = await getAsyncLocalStorage();
    talendlyGlobal.authAsyncStorage = new AsyncLocalStorage();
  }
  return talendlyGlobal.authAsyncStorage as AsyncLocalStorage<AuthContext>;
}

export async function runWithAuth<R>(
  user: AuthUser,
  fn: () => R | Promise<R>,
): Promise<R> {
  return ensureAsyncStorage().then(async (als) => {
    return als.run({ user }, fn);
  });
}

export async function getAuthUserFromContext(): Promise<AuthContext['user']> {
  return ensureAsyncStorage().then((als) => {
    const store = als.getStore();
    const user = store?.user;
    if (!user) {
      throw new Error(
        'No user found in AsyncLocalStorage. Ensure that runWithAuth is used.',
      );
    }

    return user;
  });
}
