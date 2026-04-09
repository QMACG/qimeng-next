import { z } from 'zod'

export const galgameSchema = z.object({
  sortField: z.union([
    z.literal('resource_update_time'),
    z.literal('created'),
    z.literal('view'),
    z.literal('download'),
    z.literal('favorite'),
    z.literal('rating')
  ]),
  sortOrder: z.union([z.literal('asc'), z.literal('desc')]),
  page: z.coerce.number().min(1).max(9999999),
  limit: z.coerce.number().min(1).max(24)
})
