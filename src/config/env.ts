import z from 'zod';
import type { $ZodType, $ZodObject } from 'zod/v4/core';

import { isServer } from '@/lib/utils';

const DEFAULT_PREFIX = 'NEXT_PUBLIC_' as const;

type SchemaMap = Record<string, $ZodType>;

export type InferFromSchemaMap<M extends SchemaMap> = {
  [K in keyof M]: z.infer<M[K]>;
};

type CreateEnvOptions<Server extends SchemaMap, Client extends SchemaMap> = {
  /** Server-only variables (MUST NOT start with clientPrefix) */
  server: Server;
  /** Client-exposed variables (MUST start with clientPrefix, default: NEXT_PUBLIC_) */
  client: Client;
  /** Typically pass `process.env` here */
  runtimeEnv: Record<string, string | undefined>;
  /** Prefix for client-visible envs (defaults to NEXT_PUBLIC_) */
  clientPrefix?: string;
  /** Enable verbose logs in development */
  verbose?: boolean;
};

function makeObjectSchema(
  map: SchemaMap,
): $ZodObject<Record<string, $ZodType>> {
  const shape: Record<string, $ZodType> = {};
  for (const [k, v] of Object.entries(map)) {
    shape[k] = v;
  }
  return z.object(shape);
}

function hasClientPrefix(key: string, prefix: string) {
  return key.startsWith(prefix);
}

function createEnv<Server extends SchemaMap, Client extends SchemaMap>({
  server,
  client,
  runtimeEnv,
  clientPrefix = DEFAULT_PREFIX,
  verbose,
}: CreateEnvOptions<Server, Client>) {
  for (const key of Object.keys(server)) {
    if (hasClientPrefix(key, clientPrefix)) {
      throw new Error(
        `Server key "${key}" must NOT start with client prefix "${clientPrefix}".`,
      );
    }
  }

  for (const key of Object.keys(client)) {
    if (!hasClientPrefix(key, clientPrefix)) {
      throw new Error(
        `Client key "${key}" must start with client prefix "${clientPrefix}".`,
      );
    }
  }

  const clientSchema = makeObjectSchema(client);
  const serverSchema = makeObjectSchema(server);

  const clientResult = z.safeParse(clientSchema, runtimeEnv);
  const serverResult = isServer()
    ? z.safeParse(serverSchema, runtimeEnv)
    : null;
  // : { success: true, data: {} as InferFromSchemaMap<Server> };

  if (!clientResult.success) {
    const prettyError = z.prettifyError(clientResult.error);
    throw new Error(
      `Invalid CLIENT env:\n${prettyError}\n\nHint: All client variables must be prefixed with '${clientPrefix}'.`,
    );
  }

  const clientData = clientResult.data as InferFromSchemaMap<Client>;

  if (serverResult && !serverResult.success) {
    const prettyError = z.prettifyError(serverResult.error);
    throw new Error(
      `Invalid SERVER env:\n${prettyError}\n\nHint: Ensure required server variables exist in your runtime.`,
    );
  }

  const serverData = (
    serverResult && serverResult.success ? serverResult.data : {}
  ) as InferFromSchemaMap<Server>;

  const target = {
    ...(isServer() ? serverData : ({} as InferFromSchemaMap<Server>)),
    ...clientData,
  };

  if (verbose && isServer()) {
    const missingServer = Object.keys(server).filter(
      (k) => target[k] === undefined,
    );
    const missingClient = Object.keys(client).filter(
      (k) => target[k] === undefined,
    );
    if (missingServer.length || missingClient.length) {
      console.warn('Missing env keys', { missingServer, missingClient });
    }
  }

  const frozenTarget = Object.freeze(target);

  return new Proxy(frozenTarget, {
    get(target, prop, receiver) {
      if (!isServer() && typeof prop === 'string' && prop in server) {
        throw new Error(
          `Attempted to access server env key "${String(
            prop,
          )}" from the client. This key is not available on the client and should only be accessed in server-side code.`,
        );
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

export const env = createEnv({
  client: {
    // Vercel automatically injects these environment variables during builds and runtime. See https://vercel.com/docs/build-step#system-environment-variables for details.
    NEXT_PUBLIC_VERCEL_ENV: z
      .enum(['development', 'preview', 'production'])
      .optional(),
    NEXT_PUBLIC_VERCEL_TARGET_ENV: z
      .enum(['development', 'preview', 'production'])
      .optional(),
    NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
    NEXT_PUBLIC_VERCEL_BRANCH_URL: z.string().optional(),
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
    NEXT_PUBLIC_VERCEL_REGION: z.string().optional(),
    NEXT_PUBLIC_VERCEL_DEPLOYMENT_ID: z.string().optional(),

    NEXT_PUBLIC_SITE_URL: z.url(),
    NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(['en', 'el']).default('en'),
  },
  server: {
    LOG_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
      .default('info'),
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
  },
  runtimeEnv: {
    // Vercel envs
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
    NEXT_PUBLIC_VERCEL_TARGET_ENV: process.env.NEXT_PUBLIC_VERCEL_TARGET_ENV,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_VERCEL_BRANCH_URL: process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL,
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL:
      process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    NEXT_PUBLIC_VERCEL_REGION: process.env.NEXT_PUBLIC_VERCEL_REGION,
    NEXT_PUBLIC_VERCEL_DEPLOYMENT_ID:
      process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_ID,

    // Client envs
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,

    // Server envs
    LOG_LEVEL: process.env.LOG_LEVEL,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  },
});
