import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { SchemaError } from '@standard-schema/utils';
import type { ServerFormState } from '@tanstack/react-form';

import type { AppException } from '@/internals/exceptions';
import { getFormErrors } from '@/internals/standard-schema';
import { omit } from '@/lib/utils';

export function toActionError(exception: AppException) {
  return omit(exception.toObject(), ['context']);
}

export function createValidationErrorFormState<
  TSchema extends StandardSchemaV1,
>(
  values: StandardSchemaV1.InferOutput<TSchema>,
  schemaError: SchemaError,
): ServerFormState<StandardSchemaV1.InferOutput<TSchema>, TSchema> {
  const { fieldErrors: onServerError } = getFormErrors<TSchema>(schemaError);

  return {
    values,
    errors: [
      onServerError as ServerFormState<
        StandardSchemaV1.InferOutput<TSchema>,
        TSchema
      >['errors'][number],
    ],
    errorMap: {
      onServer: onServerError as ServerFormState<
        StandardSchemaV1.InferOutput<TSchema>,
        TSchema
      >['errorMap']['onServer'],
    },
  };
}
