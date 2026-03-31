import type { FormDataInfo } from 'decode-formdata';
import { decode } from 'decode-formdata';
import { z } from 'zod';

/**
 * Wraps a Zod schema with a `decode-formdata` preprocess step so the schema
 * accepts a raw `FormData` object directly as input.
 *
 * This keeps type decoding co-located with validation — the schema is the
 * single source of truth for both. No `z.coerce.*` needed.
 *
 * @example
 * const productSchema = withFormData(
 *   z.object({
 *     title:  z.string(),
 *     price:  z.number(),
 *     active: z.boolean(),
 *     tags:   z.array(z.string()),
 *     images: z.array(z.object({ file: z.instanceof(File) })),
 *   }),
 *   {
 *     numbers:  ['price'],
 *     booleans: ['active'],
 *     arrays:   ['tags', 'images'],
 *     files:    ['images.$.file'],
 *   },
 * );
 *
 * // Use with createFormAction — the factory passes raw FormData:
 * export const createProduct = createFormAction({
 *   input: productSchema,
 *   async handler(data) {
 *     // data is fully typed: { title: string; price: number; active: boolean; ... }
 *   },
 * });
 */
export function withFormData<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  info: FormDataInfo = {},
) {
  // `input: FormData` annotation makes TypeScript infer B=FormData in
  // ZodPipe<ZodTransform<Record<string,unknown>, FormData>, TSchema>,
  // so createFormAction correctly enforces the FormData call signature.
  return z.preprocess((input: FormData) => decode(input, info), schema);
}
