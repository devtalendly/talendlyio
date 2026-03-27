/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AsyncLocalStorage } from './index';

type TalendlyGlobal = Record<string, AsyncLocalStorage<unknown>>;

const __context: TalendlyGlobal = {};
const symbol = Symbol.for('talendly:global');

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      [symbol]?: TalendlyGlobal;
    }
  }
}

export function __getTalendlyGlobal(): TalendlyGlobal {
  if (!(globalThis as any)[symbol]) {
    (globalThis as any)[symbol] = __context;
  }
  return (globalThis as any)[symbol];
}
