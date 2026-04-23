import { z } from 'zod'
import { createHttpUrlOrPathSchema } from './shared'

export const advertisementKindSchema = z.enum([
  'home_box',
  'featured_post',
  'redirect_box'
])

export const featuredAdvertisementTargetModeSchema = z.enum([
  'article',
  'external'
])

const baseAdvertisementSchema = z.object({
  visibleForGuest: z.coerce.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(999999).default(0)
})

const emptyDocPostIdSchema = z.coerce
  .number()
  .int()
  .min(1)
  .nullish()
  .transform(() => null)

export const homeBoxAdvertisementSchema = baseAdvertisementSchema.extend({
  kind: z.literal('home_box'),
  title: z.string().optional().default(''),
  banner: createHttpUrlOrPathSchema('广告封面必须是有效的图片链接或站内路径'),
  link: createHttpUrlOrPathSchema('广告跳转链接必须是有效的网址或站内路径'),
  slot: z.coerce.number().int().min(1).max(4),
  docPostId: emptyDocPostIdSchema,
  targetMode: featuredAdvertisementTargetModeSchema
    .nullish()
    .transform(() => null)
})

export const featuredArticleAdvertisementSchema =
  baseAdvertisementSchema.extend({
    kind: z.literal('featured_post'),
    targetMode: z.literal('article'),
    title: z.string().optional().default(''),
    docPostId: z.coerce.number().int().min(1, { message: '请选择广告文章' }),
    banner: z.string().optional().default(''),
    link: z.string().trim().optional().default(''),
    slot: z.coerce
      .number()
      .int()
      .min(1)
      .nullish()
      .transform(() => null)
  })

export const featuredExternalAdvertisementSchema =
  baseAdvertisementSchema.extend({
    kind: z.literal('featured_post'),
    targetMode: z.literal('external'),
    title: z
      .string()
      .trim()
      .min(1, { message: '请输入广告标题' })
      .max(255, { message: '广告标题不能超过 255 个字符' }),
    docPostId: emptyDocPostIdSchema,
    banner: createHttpUrlOrPathSchema('广告封面必须是有效的图片链接或站内路径'),
    link: createHttpUrlOrPathSchema('广告跳转链接必须是有效的网址或站内路径'),
    slot: z.coerce
      .number()
      .int()
      .min(1)
      .nullish()
      .transform(() => null)
  })

export const redirectBoxAdvertisementSchema = baseAdvertisementSchema.extend({
  kind: z.literal('redirect_box'),
  title: z.string().optional().default(''),
  banner: createHttpUrlOrPathSchema('广告封面必须是有效的图片链接或站内路径'),
  link: createHttpUrlOrPathSchema('广告跳转链接必须是有效的网址或站内路径'),
  slot: z.coerce
    .number()
    .int()
    .min(1)
    .nullish()
    .transform(() => null),
  docPostId: emptyDocPostIdSchema,
  targetMode: featuredAdvertisementTargetModeSchema
    .nullish()
    .transform(() => null)
})

export const createAdvertisementSchema = z.union([
  homeBoxAdvertisementSchema,
  featuredArticleAdvertisementSchema,
  featuredExternalAdvertisementSchema,
  redirectBoxAdvertisementSchema
])

const advertisementIdSchema = {
  id: z.coerce.number().int().min(1).max(9999999)
}

export const updateAdvertisementSchema = z.union([
  homeBoxAdvertisementSchema.extend(advertisementIdSchema),
  featuredArticleAdvertisementSchema.extend(advertisementIdSchema),
  featuredExternalAdvertisementSchema.extend(advertisementIdSchema),
  redirectBoxAdvertisementSchema.extend(advertisementIdSchema)
])

export const deleteAdvertisementSchema = z.object({
  id: z.coerce.number().int().min(1).max(9999999)
})
