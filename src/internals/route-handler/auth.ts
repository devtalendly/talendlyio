import { createException } from '@/internals/exceptions';
import type { AuthUser } from '@/lib/auth';
import { currentUser } from '@/modules/auth/session';
import { createRouteHandler } from './index';
import type {
  HandlerInput,
  HttpMethod,
  RouteHandlerOptions,
  RouteSchema,
} from './types';

type AuthenticatedHandlerFn<
  M extends HttpMethod,
  TSchema extends RouteSchema<M>,
  TOutput,
> = (
  payload: HandlerInput<TSchema> & {
    ctx: { user: AuthUser };
  },
) => Promise<TOutput>;

type AuthenticatedActionOptions<
  M extends HttpMethod,
  TSchema extends RouteSchema<M>,
  TOutput,
> = Omit<RouteHandlerOptions<M, TSchema, TOutput>, 'handler'> & {
  handler: AuthenticatedHandlerFn<M, TSchema, TOutput>;
};

export function authenticatedRouteHandler<
  M extends HttpMethod,
  TSchema extends RouteSchema<M> = RouteSchema<M>,
  TOutput = void,
>(options: AuthenticatedActionOptions<M, TSchema, TOutput>) {
  return createRouteHandler<M, TSchema, TOutput>({
    ...options,
    handler: async (payload) => {
      const user = await currentUser();
      if (!user) {
        throw new createException.Unauthorized();
      }

      return options.handler({ ...payload, ctx: { user } });
    },
  });
}
