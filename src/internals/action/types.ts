import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { ServerFormState } from '@tanstack/react-form';

import type { ErrorStatusCodeName } from '@/internals/exceptions';

type ActionError = {
  message: string;
  code: ErrorStatusCodeName;
  statusCode: number;
};

type ActionStateSuccess<TSchema extends StandardSchemaV1, TData> = {
  success: true;
  formState: ServerFormState<StandardSchemaV1.InferOutput<TSchema>, TSchema>;
  data: TData;
};

type ActionStateError<TSchema extends StandardSchemaV1> = {
  success: false;
  formState: ServerFormState<StandardSchemaV1.InferOutput<TSchema>, TSchema>;
  error: ActionError;
};

type ActionState<TSchema extends StandardSchemaV1, TData> =
  | ActionStateSuccess<TSchema, TData>
  | ActionStateError<TSchema>;

type DefaultActionFn<TSchema extends StandardSchemaV1, TOutput> = (
  values: StandardSchemaV1.InferInput<TSchema>,
) => Promise<ActionState<TSchema, TOutput>>;

type FormActionFn<TSchema extends StandardSchemaV1, TOutput> = (
  formData: FormData,
) => Promise<ActionState<TSchema, TOutput>>;

type StateActionFn<TSchema extends StandardSchemaV1, TOutput> = (
  prevState: ActionState<TSchema, TOutput>,
  formData: FormData,
) => Promise<ActionState<TSchema, TOutput>>;

export type {
  ActionError,
  ActionState,
  ActionStateSuccess,
  ActionStateError,
  DefaultActionFn,
  FormActionFn,
  StateActionFn,
};
