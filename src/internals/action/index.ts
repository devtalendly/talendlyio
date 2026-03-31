import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { SchemaError } from '@standard-schema/utils';
import { decode, type FormDataInfo } from 'decode-formdata';
import { unstable_rethrow } from 'next/navigation';
import { after } from 'next/server';

import { createException, normalizeError } from '@/internals/exceptions';
import { createServerValidate } from '@/internals/server-validate';
import { tryAsync } from '@/internals/try-async';
import type {
  ActionError,
  ActionState,
  DefaultActionFn,
  FormActionFn,
  StateActionFn,
} from './types';
import { createValidationErrorFormState, toActionError } from './utils';

/**
 * Final builder step — holds the validated schema and handler.
 *
 * Optionally attach `onSuccess`, `onError`, and/or `onComplete` callbacks
 * for side-effects (logging, cache invalidation, analytics, etc.), then call
 * one of the terminal methods to get a callable action function whose signature
 * matches how it will be invoked (plain call, `<form>`, or `useActionState`).
 *
 * @template TSchema - The StandardSchema used for input validation.
 * @template TOutput - The return type of the handler.
 */
class ActionBuilderWithHandler<TSchema extends StandardSchemaV1, TOutput> {
  readonly #validate: ReturnType<typeof createServerValidate<TSchema>>;
  readonly #handlerFn: (
    payload: StandardSchemaV1.InferOutput<TSchema>,
  ) => Promise<TOutput>;

  #onSuccessFn?: (data: TOutput) => void | Promise<void>;
  #onErrorFn?: (error: ActionError) => void | Promise<void>;
  #onCompleteFn?: (
    state: ActionState<TSchema, TOutput>,
  ) => void | Promise<void>;

  constructor(
    schema: TSchema,
    handlerFn: (
      payload: StandardSchemaV1.InferOutput<TSchema>,
    ) => Promise<TOutput>,
  ) {
    this.#validate = createServerValidate(schema);
    this.#handlerFn = handlerFn;
  }

  async #run(
    values: StandardSchemaV1.InferInput<TSchema>,
  ): Promise<ActionState<TSchema, TOutput>> {
    let state: ActionState<TSchema, TOutput>;

    try {
      const [validationError, validationPayload] = await this.#validate(values);
      if (validationError) {
        throw new createException.BadRequest(undefined, {
          cause: validationError,
        });
      }

      const [error, data] = await tryAsync(this.#handlerFn(validationPayload));
      if (error) {
        throw error;
      }

      state = {
        success: true,
        data,
        formState: {
          values,
          errors: [],
          errorMap: { onServer: undefined },
        },
      };
    } catch (error) {
      unstable_rethrow(error);
      const err = normalizeError(error);
      state = {
        success: false,
        error: toActionError(err),
        formState:
          err instanceof createException.BadRequest
            ? createValidationErrorFormState<TSchema>(
                values,
                err.cause as SchemaError,
              )
            : { values, errors: [], errorMap: { onServer: undefined } },
      };
    }

    after(async () => {
      if (state.success) {
        await this.#onSuccessFn?.(state.data);
      } else {
        await this.#onErrorFn?.(state.error);
      }
      await this.#onCompleteFn?.(state);
    });

    return state;
  }

  /**
   * Registers a callback invoked after the handler resolves successfully.
   * Useful for side-effects such as cache revalidation or analytics.
   * Errors thrown inside the callback propagate and override the action result.
   *
   * @param fn - Receives the handler's return value.
   */
  onSuccess(fn: (data: TOutput) => void | Promise<void>): this {
    this.#onSuccessFn = fn;
    return this;
  }

  /**
   * Registers a callback invoked when the action produces an error state
   * (validation failure, handler error, or unexpected exception).
   * Errors thrown inside the callback propagate and override the action result.
   *
   * @param fn - Receives the normalised `ActionError` object.
   */
  onError(fn: (error: ActionError) => void | Promise<void>): this {
    this.#onErrorFn = fn;
    return this;
  }

  /**
   * Registers a callback invoked after every run, regardless of outcome.
   * Always runs after `onSuccess` / `onError`.
   * Useful for cleanup, logging, or telemetry that must fire unconditionally.
   *
   * @param fn - Receives the full `ActionState` (success or error).
   */
  onComplete(
    fn: (state: ActionState<TSchema, TOutput>) => void | Promise<void>,
  ): this {
    this.#onCompleteFn = fn;
    return this;
  }

  /**
   * Returns a plain server action called directly with validated input values.
   *
   * @example
   * ```ts
   * const login = createAction().input(schema).handler(fn).asAction();
   * await login({ email: '...', password: '...' });
   * ```
   */
  asAction(): DefaultActionFn<TSchema, TOutput> {
    return async (values) => this.#run(values);
  }

  /**
   * Returns a server action compatible with a standard HTML `<form>` submission.
   * The `FormData` is decoded using the provided `info` descriptor before validation.
   *
   * @param info - Field-type hints passed to `decode-formdata` (e.g. booleans, arrays).
   *
   * @example
   * ```ts
   * const submit = createAction().input(schema).handler(fn).asFormAction({ booleans: ['active'] });
   * // <form action={submit}>
   * ```
   */
  asFormAction(info: FormDataInfo = {}): FormActionFn<TSchema, TOutput> {
    return async (formData) => this.#run(decode(formData, info));
  }

  /**
   * Returns a server action compatible with React's `useActionState` hook.
   * Accepts `(prevState, formData)` — `prevState` is intentionally ignored.
   *
   * @param info - Field-type hints passed to `decode-formdata` (e.g. booleans, arrays).
   *
   * @example
   * ```ts
   * const submit = createAction().input(schema).handler(fn).asStateAction({});
   * const [state, action] = useActionState(submit, INITIAL_ACTION_STATE);
   * ```
   */
  asStateAction(info: FormDataInfo = {}): StateActionFn<TSchema, TOutput> {
    return async (_prevState, formData) => this.#run(decode(formData, info));
  }
}

/**
 * Builder step — schema has been set, awaiting a handler.
 *
 * @template TSchema - The StandardSchema used for input validation.
 */
class ActionBuilderWithSchema<TSchema extends StandardSchemaV1> {
  readonly #schema: TSchema;

  constructor(schema: TSchema) {
    this.#schema = schema;
  }

  /**
   * Attaches the async handler that receives validated input and returns output.
   * Errors thrown inside the handler are caught and surfaced as `ActionState` failures.
   *
   * @param fn - Async function receiving the schema-validated payload.
   */
  handler<TOutput>(
    fn: (payload: StandardSchemaV1.InferOutput<TSchema>) => Promise<TOutput>,
  ): ActionBuilderWithHandler<TSchema, TOutput> {
    return new ActionBuilderWithHandler(this.#schema, fn);
  }
}

/**
 * Entry-point builder step — awaiting an input schema.
 */
class ActionBuilder {
  /**
   * Attaches a StandardSchema for input validation.
   * Both the handler and the returned action function are typed from this schema.
   *
   * @param schema - Any StandardSchema-compliant validator (Zod, Valibot, ArkType, …).
   */
  input<TSchema extends StandardSchemaV1>(
    schema: TSchema,
  ): ActionBuilderWithSchema<TSchema> {
    return new ActionBuilderWithSchema(schema);
  }
}

/**
 * Creates a type-safe server action builder.
 *
 * Chain `.input(schema)` → `.handler(fn)` → terminal method to produce a
 * fully-typed, validated server action.
 *
 * @example
 * ```ts
 * // Plain server action
 * export const loginAction = createAction()
 *   .input(loginSchema)
 *   .handler(async ({ email, password }) => {
 *     return await authService.login(email, password);
 *   })
 *   .asAction();
 *
 * // Form action (HTML <form>)
 * export const submitForm = createAction()
 *   .input(contactSchema)
 *   .handler(async (payload) => { ... })
 *   .asFormAction({ arrays: ['tags'] });
 *
 * // useActionState-compatible action
 * export const registerAction = createAction()
 *   .input(registerSchema)
 *   .handler(async (payload) => { ... })
 *   .asStateAction({});
 * ```
 */
export function createServerAction(): ActionBuilder {
  return new ActionBuilder();
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
