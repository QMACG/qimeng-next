import { z } from 'zod'
import { createHttpUrlOrPathSchema } from './shared'

const duplicateQueryField = (maxLength: number) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return undefined
    }

    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }, z.string().max(maxLength).optional())

const optionalNumberArray = z
  .string()
  .optional()
  .default('[]')
  .transform((val) => {
    try {
      const parsed = JSON.parse(val)
      return Array.isArray(parsed)
        ? parsed
            .map((item: unknown) => Number(item))
            .filter((item) => Number.isInteger(item) && item > 0)
        : []
    } catch {
      return []
    }
  })

const publishedAtSchema = z
  .string()
  .trim()
  .min(1, { message: '请选择发布时间' })
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: '发布时间格式不正确'
  })

export const patchCreateSchema = z.object({
  banner: createHttpUrlOrPathSchema('封面必须是合法的图片链接或站内路径'),
  name: z.string().trim().min(1, { message: '游戏名称为必填项' }),
  publishedAt: publishedAtSchema,
  companyIds: optionalNumberArray,
  resourceNote: z.string().trim().max(20000).optional().default(''),
  introduction: z
    .string()
    .trim()
    .min(10, { message: '游戏介绍至少需要 10 个字符' })
    .max(100007, { message: '游戏介绍最大 100007 个字符' }),
  tag: z.string().max(2333, { message: '标签总长度不能超过 2333 个字符' }),
  status: z.coerce.number().min(0).max(3),
  released: z.string(),
  contentLimit: z.string().max(10)
})

export const patchUpdateSchema = z.object({
  id: z.coerce.number().min(1).max(9999999),
  banner: createHttpUrlOrPathSchema('封面必须是合法的图片链接或站内路径'),
  name: z.string().trim().min(1, { message: '游戏名称为必填项' }),
  publishedAt: publishedAtSchema,
  companyIds: z.array(z.coerce.number().int().min(1)).optional().default([]),
  resourceNote: z.string().trim().max(20000).optional().default(''),
  introduction: z
    .string()
    .trim()
    .min(10, { message: '游戏介绍至少需要 10 个字符' })
    .max(100007, { message: '游戏介绍最大 100007 个字符' }),
  tag: z.array(
    z
      .string()
      .trim()
      .min(1, { message: '单个标签至少需要 1 个字符' })
      .max(500, { message: '单个标签最大 500 个字符' })
  ),
  status: z.coerce.number().min(0).max(3),
  contentLimit: z.string().max(10),
  released: z.string().optional()
})

export const duplicateSchema = z
  .object({
    title: duplicateQueryField(1007),
    excludeId: duplicateQueryField(10)
  })
  .refine((data) => typeof data.title === 'string', {
    message: '请至少提供游戏标题进行查重'
  })

export const imageSchema = z.object({
  image: z.any()
})

export const editLinkSchema = z.object({
  name: z.string({ message: '输入内容必须为字符串' }),
  link: z
    .string({ message: '输入内容必须为字符串' })
    .url({ message: '请输入合法的链接地址' })
})
