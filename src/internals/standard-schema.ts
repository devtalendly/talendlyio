import type { StandardSchemaV1 } from '@standard-schema/spec';
import { getDotPath, SchemaError } from '@standard-schema/utils';

export async function validateInput<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  data: unknown,
): Promise<
  [SchemaError, null] | [null, StandardSchemaV1.InferOutput<TSchema>]
> {
  const result = await schema['~standard'].validate(data);
  if (result.issues) {
    return [new SchemaError(result.issues), null];
  }
  return [null, result.value];
}

export type FieldErrors<TSchema extends StandardSchemaV1> = {
  [K in keyof StandardSchemaV1.InferInput<TSchema>]?: string[];
};

export function getFormErrors<TSchema extends StandardSchemaV1>(
  error: SchemaError,
) {
  const formErrors: string[] = [];
  const fieldErrors: Record<string, string[]> = {};
  if (error.issues) {
    for (const issue of error.issues) {
      const dotPath = getDotPath(issue);
      if (dotPath) {
        if (fieldErrors[dotPath]) {
          fieldErrors[dotPath].push(issue.message);
        } else {
          fieldErrors[dotPath] = [issue.message];
        }
      } else {
        formErrors.push(issue.message);
      }
    }
  }
  return {
    formErrors,
    fieldErrors: fieldErrors as FieldErrors<TSchema>,
  };
}
