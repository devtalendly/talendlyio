import { createException } from '@/internals/exceptions';
import type { AuthUser } from '@/lib/auth';
import { currentUser } from '@/modules/auth/session';
import { createRouteHandler } from './index';
import type { HandlerInput, HttpMethod, RouteSchema } from './types';

type AuthenticatedHandlerFn<
  M extends HttpMethod,
  TSchema extends RouteSchema<M>,
  TOutput,
> = (input: HandlerInput<TSchema> & { ctx: { user: AuthUser } }) => Promise<TOutput>;

class AuthenticatedRouteHandlerBuilderWithSchema<
  M extends HttpMethod,
  TSchema extends RouteSchema<M>,
> {
  readonly #method: M;
  readonly #schema: TSchema;

  constructor(method: M, schema: TSchema) {
    this.#method = method;
    this.#schema = schema;
  }

  handler<TOutput>(fn: AuthenticatedHandlerFn<M, TSchema, TOutput>) {
    return createRouteHandler()
      .method(this.#method)
      .schema(this.#schema)
      .handler(async (input) => {
        const user = await currentUser();
        if (!user) {
          throw new createException.Unauthorized();
        }

        return fn({ ...input, ctx: { user } });
      });
  }
}

class AuthenticatedRouteHandlerBuilderWithMethod<M extends HttpMethod> {
  readonly #method: M;

  constructor(method: M) {
    this.#method = method;
  }

  schema<TSchema extends RouteSchema<M>>(
    schema: TSchema,
  ): AuthenticatedRouteHandlerBuilderWithSchema<M, TSchema> {
    return new AuthenticatedRouteHandlerBuilderWithSchema(this.#method, schema);
  }

  handler<TOutput>(
    fn: AuthenticatedHandlerFn<M, RouteSchema<M>, TOutput>,
  ) {
    return createRouteHandler()
      .method(this.#method)
      .handler(async (input) => {
        const user = await currentUser();
        if (!user) {
          throw new createException.Unauthorized();
        }

        return fn({ ...input, ctx: { user } });
      });
  }
}

class AuthenticatedRouteHandlerBuilder {
  method<M extends HttpMethod>(
    method: M,
  ): AuthenticatedRouteHandlerBuilderWithMethod<M> {
    return new AuthenticatedRouteHandlerBuilderWithMethod(method);
  }
}

export function authenticatedRouteHandler(): AuthenticatedRouteHandlerBuilder {
  return new AuthenticatedRouteHandlerBuilder();
}
