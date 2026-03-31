import { after, type NextRequest } from 'next/server';

import { type AppException, createException } from '@/internals/exceptions';
import { validateInput } from '@/internals/standard-schema';
import { tryAsync } from '@/internals/try-async';
import type {
  HandlerInput,
  HttpMethod,
  NextRouteContext,
  NextRouteHandler,
  RouteSchema,
} from './types';
import { BODYLESS_METHODS, toErrorResponse, toSuccessResponse } from './utils';

type ProcessResult<TOutput> =
  | { success: true; data: TOutput; response: Response }
  | { success: false; error: AppException; response: Response };

/**
 * Final builder step — holds the method, optional schema, and handler.
 *
 * Optionally attach `onSuccess`, `onError`, and/or `onComplete` callbacks
 * for side-effects (logging, cache invalidation, analytics, etc.).
 * Optionally call `.successStatus()` to override the default `200`, then
 * call `.build()` to get the Next.js route handler function.
 *
 * @template M       - The HTTP method (constrains whether `body` is allowed).
 * @template TSchema - The route schema describing which parts of the request are validated.
 * @template TOutput - The return type of the handler.
 */
class RouteHandlerBuilderWithHandler<
  M extends HttpMethod,
  TSchema extends RouteSchema<M>,
  TOutput,
> {
  readonly #method: M;
  readonly #schema: TSchema | undefined;
  readonly #handlerFn: (input: HandlerInput<TSchema>) => Promise<TOutput>;
  #successStatus = 200;

  #onSuccessFn?: (data: TOutput) => void | Promise<void>;
  #onErrorFn?: (error: AppException) => void | Promise<void>;
  #onCompleteFn?: (response: Response) => void | Promise<void>;

  constructor(
    method: M,
    schema: TSchema | undefined,
    handlerFn: (input: HandlerInput<TSchema>) => Promise<TOutput>,
  ) {
    this.#method = method;
    this.#schema = schema;
    this.#handlerFn = handlerFn;
  }

  async #process(
    request: NextRequest,
    context: NextRouteContext,
  ): Promise<ProcessResult<TOutput>> {
    const isBodyless = BODYLESS_METHODS.has(this.#method);
    const schema = this.#schema;

    let body: unknown = undefined;
    if (!isBodyless && schema?.body) {
      const [parseError, rawBody] = await tryAsync(request.json());
      if (parseError) {
        const error = new createException.BadRequest('Invalid JSON body');
        return { success: false, error, response: toErrorResponse(error) };
      }

      const [validationError, validated] = await validateInput(
        schema.body,
        rawBody,
      );
      if (validationError) {
        const error = new createException.BadRequest(
          'Request body validation failed',
          { context: { issues: validationError.issues } },
        );
        return { success: false, error, response: toErrorResponse(error) };
      }
      body = validated;
    }

    let query: unknown = undefined;
    if (schema?.query) {
      const { searchParams } = new URL(request.url);
      const raw = Object.fromEntries(searchParams.entries());
      const [validationError, validated] = await validateInput(
        schema.query,
        raw,
      );
      if (validationError) {
        const error = new createException.BadRequest(
          'Query string validation failed',
          { context: { issues: validationError.issues } },
        );
        return { success: false, error, response: toErrorResponse(error) };
      }
      query = validated;
    }

    let headers: unknown = undefined;
    if (schema?.headers) {
      const raw = Object.fromEntries(request.headers.entries());
      const [validationError, validated] = await validateInput(
        schema.headers,
        raw,
      );
      if (validationError) {
        const error = new createException.BadRequest(
          'Request headers validation failed',
          { context: { issues: validationError.issues } },
        );
        return { success: false, error, response: toErrorResponse(error) };
      }
      headers = validated;
    }

    let params: unknown = undefined;
    if (schema?.params) {
      const raw = await context.params;
      const [validationError, validated] = await validateInput(
        schema.params,
        raw,
      );
      if (validationError) {
        const error = new createException.BadRequest(
          'Route params validation failed',
          { context: { issues: validationError.issues } },
        );
        return { success: false, error, response: toErrorResponse(error) };
      }
      params = validated;
    }

    const [handlerError, data] = await tryAsync(
      this.#handlerFn({
        body: body as HandlerInput<TSchema>['body'],
        headers: headers as HandlerInput<TSchema>['headers'],
        query: query as HandlerInput<TSchema>['query'],
        params: params as HandlerInput<TSchema>['params'],
        request,
      }),
    );

    if (handlerError) {
      return {
        success: false,
        error: handlerError,
        response: toErrorResponse(handlerError),
      };
    }

    let responseData: unknown = data;
    if (schema?.response) {
      const [validationError, validated] = await validateInput(
        schema.response,
        data,
      );
      if (validationError) {
        const error = new createException.InternalServerError(
          'Response validation failed',
        );
        return { success: false, error, response: toErrorResponse(error) };
      }
      responseData = validated;
    }

    return {
      success: true,
      data,
      response: toSuccessResponse(responseData, this.#successStatus),
    };
  }

  async #run(
    request: NextRequest,
    context: NextRouteContext,
  ): Promise<Response> {
    const result = await this.#process(request, context);

    after(async () => {
      if (result.success) {
        await this.#onSuccessFn?.(result.data);
      } else {
        await this.#onErrorFn?.(result.error);
      }
      await this.#onCompleteFn?.(result.response);
    });

    return result.response;
  }

  /**
   * Overrides the HTTP status code sent on a successful response.
   * Defaults to `200` if not called.
   *
   * @param status - A valid HTTP success status code (e.g. `201`, `204`).
   *
   * @example
   * ```ts
   * createRouteHandler().method('POST').handler(fn).successStatus(201).build();
   * ```
   */
  successStatus(status: number): this {
    this.#successStatus = status;
    return this;
  }

  /**
   * Registers a callback invoked after the handler resolves successfully
   * and the response shape has been validated.
   * Errors thrown inside the callback propagate and are not caught.
   *
   * @param fn - Receives the handler's raw return value.
   */
  onSuccess(fn: (data: TOutput) => void | Promise<void>): this {
    this.#onSuccessFn = fn;
    return this;
  }

  /**
   * Registers a callback invoked when the request processing produces an error
   * (request parsing, input/output validation, or handler error).
   * Errors thrown inside the callback propagate and are not caught.
   *
   * @param fn - Receives the `AppException` that caused the failure.
   */
  onError(fn: (error: AppException) => void | Promise<void>): this {
    this.#onErrorFn = fn;
    return this;
  }

  /**
   * Registers a callback invoked after every request, regardless of outcome.
   * Always runs after `onSuccess` / `onError`.
   * Useful for logging or telemetry that must fire unconditionally.
   *
   * @param fn - Receives the final `Response` that will be returned to the client.
   */
  onComplete(fn: (response: Response) => void | Promise<void>): this {
    this.#onCompleteFn = fn;
    return this;
  }

  /**
   * Compiles and returns the Next.js route handler `(request, context) => Response`.
   *
   * At runtime the handler will, in order:
   * 1. Parse and validate `body` (non-bodyless methods only, if a body schema was provided).
   * 2. Parse and validate `query` search params (if a query schema was provided).
   * 3. Parse and validate `headers` (if a headers schema was provided).
   * 4. Await and validate dynamic route `params` (if a params schema was provided).
   * 5. Call the handler function with the validated inputs.
   * 6. Validate the response shape (if a response schema was provided).
   * 7. Fire `onSuccess` / `onError` and then `onComplete` callbacks.
   * 8. Return a JSON `Response` with the configured success status, or an error response.
   *
   * @example
   * ```ts
   * export const GET = createRouteHandler().method('GET').handler(fn).build();
   * ```
   */
  build(): NextRouteHandler {
    return (request, context) => this.#run(request, context);
  }
}

/**
 * Builder step — method and schema have been set, awaiting a handler.
 *
 * @template M       - The HTTP method.
 * @template TSchema - The route schema; constrains the handler's input types.
 */
class RouteHandlerBuilderWithSchema<
  M extends HttpMethod,
  TSchema extends RouteSchema<M>,
> {
  readonly #method: M;
  readonly #schema: TSchema;

  constructor(method: M, schema: TSchema) {
    this.#method = method;
    this.#schema = schema;
  }

  /**
   * Attaches the async handler that receives the validated request inputs.
   * Errors thrown inside the handler are caught and returned as error responses.
   *
   * @param fn - Async function receiving `{ body, query, headers, params, request }`,
   *             each typed according to the schemas provided earlier.
   */
  handler<TOutput>(
    fn: (input: HandlerInput<TSchema>) => Promise<TOutput>,
  ): RouteHandlerBuilderWithHandler<M, TSchema, TOutput> {
    return new RouteHandlerBuilderWithHandler(this.#method, this.#schema, fn);
  }
}

/**
 * Builder step — method has been set.
 *
 * Optionally call `.schema()` to attach request/response validation schemas,
 * or call `.handler()` directly if no validation is needed.
 *
 * @template M - The HTTP method.
 */
class RouteHandlerBuilderWithMethod<M extends HttpMethod> {
  readonly #method: M;

  constructor(method: M) {
    this.#method = method;
  }

  /**
   * Attaches validation schemas for any combination of `body`, `query`,
   * `headers`, `params`, and `response`.
   *
   * - `body` is only accepted on non-bodyless methods (`POST`, `PUT`, `PATCH`).
   * - `response` validation failures return `500` (programmer error, not client error).
   *
   * @param schema - Partial schema object; only include the slots you need to validate.
   *
   * @example
   * ```ts
   * createRouteHandler()
   *   .method('POST')
   *   .schema({ body: createUserSchema, response: userSchema })
   *   .handler(fn)
   *   .build();
   * ```
   */
  schema<TSchema extends RouteSchema<M>>(
    schema: TSchema,
  ): RouteHandlerBuilderWithSchema<M, TSchema> {
    return new RouteHandlerBuilderWithSchema(this.#method, schema);
  }

  /**
   * Attaches a handler without any request validation.
   * All input fields (`body`, `query`, `headers`, `params`) will be `undefined`.
   *
   * @param fn - Async handler receiving `{ request }` and untyped `undefined` inputs.
   */
  handler<TOutput>(
    fn: (input: HandlerInput<RouteSchema<M>>) => Promise<TOutput>,
  ): RouteHandlerBuilderWithHandler<M, RouteSchema<M>, TOutput> {
    return new RouteHandlerBuilderWithHandler(this.#method, undefined, fn);
  }
}

/**
 * Entry-point builder step — awaiting an HTTP method.
 */
class RouteHandlerBuilder {
  /**
   * Sets the HTTP method for this route handler.
   * The method constrains which schema slots are available — `body` is not
   * allowed on `GET`, `HEAD`, `DELETE`, or `OPTIONS`.
   *
   * @param method - One of the supported HTTP methods.
   */
  method<M extends HttpMethod>(method: M): RouteHandlerBuilderWithMethod<M> {
    return new RouteHandlerBuilderWithMethod(method);
  }
}

/**
 * Creates a type-safe Next.js route handler builder.
 *
 * Chain `.method()` → (optional) `.schema()` → `.handler()` → `.build()` to
 * produce a validated `(request, context) => Response` function ready to export
 * from an App Router route file.
 *
 * @example
 * ```ts
 * // GET with query validation
 * export const GET = createRouteHandler()
 *   .method('GET')
 *   .schema({ query: searchParamsSchema })
 *   .handler(async ({ query }) => {
 *     return await searchCandidates(query);
 *   })
 *   .build();
 *
 * // POST with body + response validation, custom status
 * export const POST = createRouteHandler()
 *   .method('POST')
 *   .schema({ body: createUserSchema, response: userSchema })
 *   .handler(async ({ body }) => {
 *     return await createUser(body);
 *   })
 *   .successStatus(201)
 *   .build();
 *
 * // No validation needed
 * export const GET = createRouteHandler()
 *   .method('GET')
 *   .handler(async ({ request }) => ({ ok: true }))
 *   .build();
 * ```
 */
export function createRouteHandler(): RouteHandlerBuilder {
  return new RouteHandlerBuilder();
}
