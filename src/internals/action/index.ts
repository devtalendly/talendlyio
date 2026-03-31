import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { SchemaError } from '@standard-schema/utils';
import { decode } from 'decode-formdata';

import { createException } from '@/internals/exceptions';
import { createServerValidate } from '@/internals/server-validate';
import { tryAsync } from '@/internals/try-async';
import type {
  ActionFnByType,
  ActionOptions,
  ActionState,
  ActionType,
} from './types';
import { createValidationErrorFormState, toActionError } from './utils';

export function createAction<
  TSchema extends StandardSchemaV1,
  AT extends ActionType = 'default',
  TOutput = void,
>(
  options: ActionOptions<TSchema, AT, TOutput>,
): ActionFnByType<TSchema, AT, TOutput> {
  const { schema, handler, type = 'default' as AT } = options;

  const onServerValidate = createServerValidate(schema);

  async function runAction(
    values: StandardSchemaV1.InferInput<TSchema>,
  ): Promise<ActionState<TSchema, TOutput>> {
    const [validationError, validationPayload] = await onServerValidate(values);

    if (validationError) {
      const exception = new createException.BadRequest(undefined, {
        cause: validationError,
      });

      return {
        success: false,
        error: toActionError(exception),
        formState: createValidationErrorFormState<TSchema>(
          values,
          exception.cause as SchemaError,
        ),
      };
    }

    const [error, data] = await tryAsync(handler(validationPayload));
    if (error) {
      return {
        success: false,
        error: toActionError(error),
        formState: {
          values,
          errors: [],
          errorMap: { onServer: undefined },
        },
      };
    }

    return {
      success: true,
      data,
      formState: {
        values,
        errors: [],
        errorMap: { onServer: undefined },
      },
    };
  }

  switch (type) {
    case 'default': {
      return async function action(
        values: StandardSchemaV1.InferInput<TSchema>,
      ): Promise<ActionState<TSchema, TOutput>> {
        return runAction(values);
      } as ActionFnByType<TSchema, AT, TOutput>;
    }
    case 'form-action': {
      return async function formAction(
        formData: FormData,
      ): Promise<ActionState<TSchema, TOutput>> {
        return runAction(
          decode(formData) as StandardSchemaV1.InferInput<TSchema>,
        );
      } as ActionFnByType<TSchema, AT, TOutput>;
    }
    case 'state-action': {
      return async function stateAction(
        _prevState: ActionState<TSchema, TOutput>,
        formData: FormData,
      ): Promise<ActionState<TSchema, TOutput>> {
        return runAction(
          decode(formData) as StandardSchemaV1.InferInput<TSchema>,
        );
      } as ActionFnByType<TSchema, AT, TOutput>;
    }
    default: {
      throw new Error(`Unsupported action type: ${type}`);
    }
  }
}

export const INITIAL_ACTION_STATE = {
  success: true,
  formState: {
    values: undefined,
    errors: [],
    errorMap: { onServer: undefined },
  },
  data: undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies ActionState<any, undefined>;
