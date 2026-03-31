import type { NextRequest } from 'next/server';

import { createException } from '@/internals/exceptions';
import { validateInput } from '@/internals/standard-schema';
import { tryAsync } from '@/internals/try-async';
import type {
  HandlerInput,
  HttpMethod,
  NextRouteContext,
  NextRouteHandler,
  RouteHandlerOptions,
  RouteSchema,
} from './types';
import { BODYLESS_METHODS, toErrorResponse, toSuccessResponse } from './utils';

export function createRouteHandler<
  M extends HttpMethod,
  TSchema extends RouteSchema<M> = RouteSchema<M>,
  TOutput = void,
>(options: RouteHandlerOptions<M, TSchema, TOutput>): NextRouteHandler {
  const { successStatus = 200, method, schema, handler } = options;
  const isBodyless = BODYLESS_METHODS.has(method);

  return async function routeHandler(
    request: NextRequest,
    context: NextRouteContext,
  ): Promise<Response> {
    let body: unknown = undefined;
    if (!isBodyless && schema?.body) {
      const [parseError, rawBody] = await tryAsync(request.json());
      if (parseError) {
        return toErrorResponse(
          new createException.BadRequest('Invalid JSON body'),
        );
      }

      const [validationError, validated] = await validateInput(
        schema.body,
        rawBody,
      );
      if (validationError) {
        return toErrorResponse(
          new createException.BadRequest('Request body validation failed', {
            context: { issues: validationError.issues },
          }),
        );
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
        return toErrorResponse(
          new createException.BadRequest('Query string validation failed', {
            context: { issues: validationError.issues },
          }),
        );
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
        return toErrorResponse(
          new createException.BadRequest('Request headers validation failed', {
            context: { issues: validationError.issues },
          }),
        );
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
        return toErrorResponse(
          new createException.BadRequest('Route params validation failed', {
            context: { issues: validationError.issues },
          }),
        );
      }
      params = validated;
    }

    const [handlerError, data] = await tryAsync(
      handler({
        body: body as HandlerInput<TSchema>['body'],
        headers: headers as HandlerInput<TSchema>['headers'],
        query: query as HandlerInput<TSchema>['query'],
        params: params as HandlerInput<TSchema>['params'],
        request,
      }),
    );

    if (handlerError) {
      return toErrorResponse(handlerError);
    }

    let responseData: unknown = data;
    if (schema?.response) {
      const [validationError, validated] = await validateInput(
        schema.response,
        data,
      );
      if (validationError) {
        // Shape mismatch is a programmer error, not a client error
        return toErrorResponse(
          new createException.InternalServerError('Response validation failed'),
        );
      }
      responseData = validated;
    }

    return toSuccessResponse(responseData, successStatus);
  };
}
