import { z } from 'zod'
import { createHttpUrlOrPathSchema } from './shared'
import { normalizeFriendLinkUrl } from '~/utils/friendLink'
import { FRIEND_LINK_STATUS } from '~/constants/friend-link'

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const validateFriendLinkUrl = (value: string) => {
  try {
    const parsed = new URL(normalizeFriendLinkUrl(value))
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const friendLinkBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: '请填写站点名称' })
    .max(255, { message: '站点名称不能超过 255 个字符' }),
  avatar: z.preprocess(
    emptyToUndefined,
    createHttpUrlOrPathSchema('网站图标必须是有效的图片链接或站内路径')
      .optional()
      .transform((value) => value ?? '')
  ),
  description: z
    .string()
    .trim()
    .max(1007, { message: '网站简介不能超过 1007 个字符' })
    .default(''),
  link: z
    .string()
    .trim()
    .min(1, { message: '请填写网站网址' })
    .refine(validateFriendLinkUrl, { message: '请输入有效的网站链接' }),
  sortOrder: z.coerce
    .number()
    .int()
    .min(0, { message: '排序值不能小于 0' })
    .max(999999, { message: '排序值不能超过 999999' })
    .default(0),
  status: z
    .coerce
    .number()
    .int()
    .refine(
      (value) =>
        value === FRIEND_LINK_STATUS.pending ||
        value === FRIEND_LINK_STATUS.normal ||
        value === FRIEND_LINK_STATUS.hidden,
      { message: '请选择有效的友链状态' }
    )
    .default(FRIEND_LINK_STATUS.normal)
})

export const createFriendLinkSchema = friendLinkBaseSchema

export const updateFriendLinkSchema = friendLinkBaseSchema.extend({
  id: z.coerce.number().int().min(1).max(9999999)
})

export const createFriendLinkApplySchema = friendLinkBaseSchema
  .omit({
    sortOrder: true,
    status: true
  })
  .extend({
    sortOrder: z.coerce.number().int().default(0),
    status: z.coerce.number().int().default(FRIEND_LINK_STATUS.pending)
  })

export const deleteFriendLinkSchema = z.object({
  id: z.coerce.number().int().min(1).max(9999999)
})
