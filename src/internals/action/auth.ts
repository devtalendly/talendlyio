import type { StandardSchemaV1 } from '@standard-schema/spec';

import { createException } from '@/internals/exceptions';
import type { AuthUser } from '@/lib/auth';
import { currentUser } from '@/modules/auth/session';
import { createServerAction } from './index';

type AuthenticatedHandlerFn<TSchema extends StandardSchemaV1, TOutput> = (
  payload: StandardSchemaV1.InferOutput<TSchema>,
  ctx: { user: AuthUser },
) => Promise<TOutput>;

class AuthenticatedActionBuilderWithSchema<TSchema extends StandardSchemaV1> {
  constructor(private readonly schema: TSchema) {}

  handler<TOutput>(fn: AuthenticatedHandlerFn<TSchema, TOutput>) {
    return createServerAction()
      .input(this.schema)
      .handler(async (payload) => {
        const user = await currentUser();
        if (!user) {
          throw new createException.Unauthorized();
        }

        return fn(payload, { user });
      });
  }
}

class AuthenticatedActionBuilder {
  input<TSchema extends StandardSchemaV1>(
    schema: TSchema,
  ): AuthenticatedActionBuilderWithSchema<TSchema> {
    return new AuthenticatedActionBuilderWithSchema(schema);
  }
}

export function authenticatedAction(): AuthenticatedActionBuilder {
  return new AuthenticatedActionBuilder();
}
