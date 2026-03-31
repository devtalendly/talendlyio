import type { StandardSchemaV1 } from '@standard-schema/spec';

import { createException } from '@/internals/exceptions';
import type { AuthUser } from '@/lib/auth';
import { currentUser } from '@/modules/auth/session';
import { createAction } from './index';
import type { ActionOptions, ActionType } from './types';

type AuthenticatedHandlerFn<TSchema extends StandardSchemaV1, TOutput> = (
  payload: StandardSchemaV1.InferOutput<TSchema>,
  ctx: { user: AuthUser },
) => Promise<TOutput>;

type AuthenticatedActionOptions<
  TSchema extends StandardSchemaV1,
  AT extends ActionType,
  TOutput,
> = Omit<ActionOptions<TSchema, AT, TOutput>, 'handler'> & {
  handler: AuthenticatedHandlerFn<TSchema, TOutput>;
};

export function authenticatedAction<
  TSchema extends StandardSchemaV1,
  AT extends ActionType = 'default',
  TOutput = void,
>(options: AuthenticatedActionOptions<TSchema, AT, TOutput>) {
  return createAction<TSchema, AT, TOutput>({
    ...options,
    type: options.type ?? ('default' as AT),
    handler: async (payload) => {
      const user = await currentUser();
      if (!user) {
        throw new createException.Unauthorized();
      }

      return options.handler(payload, { user });
    },
  });
}
