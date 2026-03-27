import { getDatabase, type Database } from '@/lib/db';
import { __getTalendlyGlobal } from './global';
import { getAsyncLocalStorage, type AsyncLocalStorage } from './index';

type DatabaseTransaction = Parameters<
  Parameters<Database['transaction']>[0]
>[0];

type DatabaseContext = {
  db: Database | DatabaseTransaction;
};

async function ensureAsyncStorage() {
  const talendlyGlobal = __getTalendlyGlobal();
  if (!talendlyGlobal.dbAsyncStorage) {
    const AsyncLocalStorage = await getAsyncLocalStorage();
    talendlyGlobal.dbAsyncStorage = new AsyncLocalStorage();
  }
  return talendlyGlobal.dbAsyncStorage as AsyncLocalStorage<DatabaseContext>;
}

export async function getDatabaseFromContext(): Promise<DatabaseContext['db']> {
  return ensureAsyncStorage().then((als) => {
    const store = als.getStore();
    const db = store?.db;
    if (!db) {
      throw new Error(
        'No database found in AsyncLocalStorage context. Ensure that runWithDatabase or runWithTransaction is used.',
      );
    }

    return db;
  });
}

export async function runWithDatabase<R>(fn: () => R | Promise<R>): Promise<R> {
  return ensureAsyncStorage().then((als) => {
    return als.run({ db: getDatabase() }, fn);
  });
}

export async function runWithTransaction<R>(
  fn: () => R | Promise<R>,
): Promise<R> {
  return ensureAsyncStorage().then((als) => {
    return getDatabase().transaction(async (trx) => {
      return als.run({ db: trx }, fn);
    });
  });
}
