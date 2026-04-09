import { z } from 'zod'
import { galgameSchema } from './galgame'

export const createTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: '标签名称不能为空' })
    .max(17, { message: '单个标签名称不能超过 17 个字符' }),
  introduction: z
    .string()
    .trim()
    .max(10007, { message: '标签介绍不能超过 10007 个字符' })
    .optional(),
  alias: z.array(
    z
      .string()
      .trim()
      .min(1, { message: '标签别名不能为空' })
      .max(17, { message: '单个标签别名不能超过 17 个字符' })
  )
})

export const updateTagSchema = createTagSchema.merge(
  z.object({
    tagId: z.coerce.number().min(1).max(9999999)
  })
)

export const getTagSchema = z.object({
  page: z.coerce.number().min(1).max(9999999),
  limit: z.coerce.number().min(1).max(100)
})

export const getTagByIdSchema = z.object({
  tagId: z.coerce.number().min(1).max(9999999)
})

const galgameListQuerySchema = galgameSchema.pick({
  sortField: true,
  sortOrder: true,
  page: true,
  limit: true
})

export const getPatchByTagSchema = z
  .object({
    tagId: z.coerce.number().min(1).max(9999999)
  })
  .merge(galgameListQuerySchema)
