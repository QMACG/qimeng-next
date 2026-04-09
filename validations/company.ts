import { z } from 'zod'
import { galgameSchema } from './galgame'

export const createCompanySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: '会社名称不能为空' })
    .max(107, { message: '单个会社名称不能超过 107 个字符' }),
  introduction: z
    .string()
    .trim()
    .max(10007, { message: '会社介绍不能超过 10007 个字符' })
    .optional(),
  alias: z
    .array(
      z
        .string()
        .trim()
        .min(1, { message: '会社别名不能为空' })
        .max(17, { message: '单个会社别名不能超过 17 个字符' })
    )
    .default([]),
  primary_language: z
    .array(
      z
        .string()
        .trim()
        .min(1, { message: '主要语言不能为空' })
        .max(17, { message: '单个主要语言不能超过 17 个字符' })
    )
    .default([]),
  official_website: z
    .array(
      z
        .string()
        .trim()
        .min(1, { message: '官网地址不能为空' })
        .max(10007, { message: '单个官网地址不能超过 10007 个字符' })
    )
    .default([]),
  parent_brand: z
    .array(
      z
        .string()
        .trim()
        .min(1, { message: '母品牌名称不能为空' })
        .max(17, { message: '单个母品牌名称不能超过 17 个字符' })
    )
    .default([])
})

export const updateCompanySchema = createCompanySchema.merge(
  z.object({
    companyId: z.coerce.number().min(1).max(9999999)
  })
)

export const getCompanySchema = z.object({
  page: z.coerce.number().min(1).max(9999999),
  limit: z.coerce.number().min(1).max(100)
})

export const getCompanyByIdSchema = z.object({
  companyId: z.coerce.number().min(1).max(9999999)
})

const galgameListQuerySchema = galgameSchema.pick({
  sortField: true,
  sortOrder: true,
  page: true,
  limit: true
})

export const getPatchByCompanySchema = z
  .object({
    companyId: z.coerce.number().min(1).max(9999999)
  })
  .merge(galgameListQuerySchema)

export const searchCompanySchema = z.object({
  query: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(107, { message: '单个搜索关键词不能超过 107 个字符' })
    )
    .min(1, { message: '请至少输入一个搜索关键词' })
    .max(10, { message: '最多只能输入 10 组搜索关键词' })
})
