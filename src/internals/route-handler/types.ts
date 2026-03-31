import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { NextRequest } from 'next/server';

type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';
type BodylessMethod = 'GET' | 'HEAD' | 'DELETE' | 'OPTIONS';

type RouteSchema<M extends HttpMethod> = {
  body?: M extends BodylessMethod ? never : StandardSchemaV1;
  headers?: StandardSchemaV1;
  query?: StandardSchemaV1;
  params?: StandardSchemaV1;
  response?: StandardSchemaV1;
};

/**
 * Infers the validated output type for a given schema slot.
 * Uses a tuple to avoid distributive behaviour so `never` → `undefined`.
 */
type InferOutput<T> = [T] extends [StandardSchemaV1]
  ? StandardSchemaV1.InferOutput<T>
  : undefined;

type HandlerInput<TSchema extends RouteSchema<HttpMethod>> = {
  body: InferOutput<TSchema['body']>;
  headers: InferOutput<TSchema['headers']>;
  query: InferOutput<TSchema['query']>;
  params: InferOutput<TSchema['params']>;
  request: NextRequest;
};

type NextRouteContext = {
  params: Promise<Record<string, string | string[]>>;
};

type NextRouteHandler = (
  request: NextRequest,
  context: RouteContext<never>,
) => Promise<Response>;

export type {
  HttpMethod,
  BodylessMethod,
  RouteSchema,
  InferOutput,
  HandlerInput,
  NextRouteContext,
  NextRouteHandler,
};
