import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { ServerFormState } from '@tanstack/react-form';

import type { ErrorStatusCodeName } from '@/internals/exceptions';

type ActionError = {
  message: string;
  code: ErrorStatusCodeName;
  statusCode: number;
};

type ActionType = 'default' | 'form-action' | 'state-action';

type ActionOptions<
  TSchema extends StandardSchemaV1,
  AT extends ActionType,
  TOutput,
> = {
  schema: TSchema;
  handler: (payload: StandardSchemaV1.InferOutput<TSchema>) => Promise<TOutput>;
  type?: AT;
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

type ActionFnByType<
  TSchema extends StandardSchemaV1,
  AT extends ActionType = 'default',
  TOutput = void,
> = AT extends 'default'
  ? DefaultActionFn<TSchema, TOutput>
  : AT extends 'form-action'
    ? FormActionFn<TSchema, TOutput>
    : StateActionFn<TSchema, TOutput>;

export type {
  ActionError,
  ActionOptions,
  ActionState,
  DefaultActionFn,
  FormActionFn,
  StateActionFn,
  ActionFnByType,
  ActionType,
};
