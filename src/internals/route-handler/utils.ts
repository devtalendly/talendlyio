import { type AppException } from '@/internals/exceptions';
import type { HttpMethod } from './types';

export const BODYLESS_METHODS = new Set<HttpMethod>([
  'GET',
  'HEAD',
  'DELETE',
  'OPTIONS',
]);

export function toErrorResponse(error: AppException): Response {
  return Response.json(
    {
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
    },
    { status: error.statusCode },
  );
}

export function toSuccessResponse<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}
