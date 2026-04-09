import { z } from 'zod'

export const searchSchema = z.object({
  queryString: z
    .string()
    .min(1)
    .max(1007, { message: '搜索内容不能超过 1007 个字符' }),
  limit: z.coerce.number().min(1).max(24),
  searchOption: z.object({
    searchInIntroduction: z.boolean().default(false),
    searchInAlias: z.boolean().default(false),
    searchInTag: z.boolean().default(false)
  }),
  page: z.coerce.number().min(1).max(9999999),
  sortField: z.union([
    z.literal('resource_update_time'),
    z.literal('created'),
    z.literal('rating'),
    z.literal('view'),
    z.literal('download'),
    z.literal('favorite')
  ]),
  sortOrder: z.union([z.literal('asc'), z.literal('desc')])
})

export const searchTagSchema = z.object({
  query: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(107, { message: '单个搜索关键词不能超过 107 个字符' })
    )
    .min(1)
    .max(10, { message: '最多只能输入 10 组关键词' })
})
