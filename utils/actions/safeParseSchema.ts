import { z } from 'zod'
import type { ZodSchema } from 'zod'
import { formatZodError } from '~/utils/formatErrorMessage'

export const safeParseSchema = <T extends ZodSchema>(
  schema: T,
  object: Record<string, unknown>
): z.infer<T> | string => {
  const result = schema.safeParse(object)
  if (!result.success) {
    return formatZodError(result.error)
  }
  return result.data
}
