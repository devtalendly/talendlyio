import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { SchemaError } from '@standard-schema/utils';

import { validateInput } from '@/internals/standard-schema';

export type OnServerValidateFn<TSchema extends StandardSchemaV1> = (
  data: unknown,
) => Promise<
  [SchemaError, null] | [null, StandardSchemaV1.InferOutput<TSchema>]
>;

export function createServerValidate<TSchema extends StandardSchemaV1>(
  schema: TSchema,
): OnServerValidateFn<TSchema> {
  return async function serverValidate(data: unknown) {
    return validateInput(schema, data);
  };
}
