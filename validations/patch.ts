import { z } from 'zod'
import {
  SUPPORTED_RESOURCE_LINK,
  SUPPORTED_RESOURCE_SECTION
} from '~/constants/resource'
import {
  KUN_GALGAME_RATING_PLAY_STATUS_CONST,
  KUN_GALGAME_RATING_RECOMMEND_CONST,
  KUN_GALGAME_RATING_SPOILER_CONST
} from '~/constants/galgame'
import { createHttpUrlOrPathSchema } from './shared'

export const patchTagChangeSchema = z.object({
  patchId: z.coerce
    .number({ message: '游戏 ID 必须为数字' })
    .min(1)
    .max(9999999),
  tagId: z
    .array(
      z.coerce.number({ message: '标签 ID 必须为数字' }).min(1).max(9999999)
    )
    .min(1, { message: '请至少选择一个标签' })
    .max(107, { message: '单个游戏最多关联 107 个标签' })
})

export const patchCompanyChangeSchema = z.object({
  patchId: z.coerce
    .number({ message: '游戏 ID 必须为数字' })
    .min(1)
    .max(9999999),
  companyId: z
    .array(
      z.coerce.number({ message: '会社 ID 必须为数字' }).min(1).max(9999999)
    )
    .min(1, { message: '请至少选择一个会社' })
    .max(107, { message: '单个游戏最多关联 107 个会社' })
})

export const patchCommentCreateSchema = z.object({
  patchId: z.coerce.number().min(1).max(9999999),
  parentId: z.coerce.number().min(1).max(9999999).nullable(),
  content: z
    .string()
    .trim()
    .min(1, { message: '评论内容至少需要 1 个字符' })
    .max(10007, { message: '评论内容最多 10007 个字符' })
})

export const patchCommentUpdateSchema = z.object({
  commentId: z.coerce.number().min(1).max(9999999),
  content: z
    .string()
    .trim()
    .min(1, { message: '评论内容至少需要 1 个字符' })
    .max(10007, { message: '评论内容最多 10007 个字符' })
})

export const getPatchCommentSchema = z.object({
  patchId: z.coerce.number().min(1).max(9999999),
  page: z.coerce.number().min(1).max(9999999),
  limit: z.coerce.number().min(1).max(50)
})

export const patchResourceCreateSchema = z.object({
  patchId: z.coerce.number().min(1).max(9999999),
  section: z
    .string()
    .refine((value) => SUPPORTED_RESOURCE_SECTION.includes(value), {
      message: '资源分区只能是网盘资源或直链资源'
    }),
  storage: z
    .string()
    .refine((value) => SUPPORTED_RESOURCE_LINK.includes(value), {
      message: '资源来源类型不合法'
    }),
  content: z
    .string()
    .trim()
    .min(1, { message: '请填写下载链接' })
    .max(20000, { message: '下载链接内容最多 20000 个字符' }),
  note: z
    .string()
    .trim()
    .max(10007, { message: '资源备注最多 10007 个字符' })
    .optional()
    .default(''),
  name: z
    .string()
    .trim()
    .max(255, { message: '资源标题最多 255 个字符' })
    .optional()
    .default(''),
  hash: z.string().max(107).optional().default(''),
  size: z.string().max(107).optional().default(''),
  code: z.string().trim().max(1007).optional().default(''),
  password: z.string().max(1007).optional().default(''),
  type: z.array(z.string()).optional().default([]),
  language: z.array(z.string()).optional().default([]),
  platform: z.array(z.string()).optional().default([])
})

export const patchResourceUpdateSchema = patchResourceCreateSchema.merge(
  z.object({
    resourceId: z.coerce.number().min(1).max(9999999)
  })
)

export const declinePullRequestSchema = z.object({
  prId: z.coerce.number({ message: 'ID 必须为数字' }).min(1).max(9999999),
  note: z
    .string({ message: '请填写拒绝原因' })
    .trim()
    .min(1, { message: '请填写拒绝原因' })
    .max(1007, { message: '拒绝原因最多 1007 个字符' })
})

export const updatePatchBannerSchema = z.object({
  patchId: z.coerce.number().min(1).max(9999999),
  banner: createHttpUrlOrPathSchema('请输入有效的封面链接或站内路径')
})

export const getPatchHistorySchema = z.object({
  patchId: z.coerce.number({ message: 'ID 必须为数字' }).min(1).max(9999999),
  page: z.coerce.number().min(1).max(9999999),
  limit: z.coerce.number().min(1).max(30)
})

export const updatePatchResourceStatsSchema = z.object({
  patchId: z.coerce.number({ message: 'ID 必须为数字' }).min(1).max(9999999),
  resourceId: z.coerce.number({ message: 'ID 必须为数字' }).min(1).max(9999999)
})

export const directDownloadPrepareSchema = z.object({
  file: z
    .string()
    .trim()
    .min(1, { message: '直链文件路径不能为空' })
    .max(1007, { message: '直链文件路径过长' }),
  captcha: z.string().trim().max(100).optional().default('')
})

export const createPatchCommentReportSchema = z.object({
  commentId: z.coerce
    .number({ message: '评论 ID 必须为数字' })
    .min(1)
    .max(9999999),
  patchId: z.coerce
    .number({ message: '游戏 ID 必须为数字' })
    .min(1)
    .max(9999999),
  content: z
    .string({ message: '举报原因为必填项' })
    .trim()
    .min(2, { message: '举报原因至少需要 2 个字符' })
    .max(5000, { message: '举报原因最多 5000 个字符' })
})

export const createPatchRatingReportSchema = z.object({
  ratingId: z.coerce
    .number({ message: '评分 ID 必须为数字' })
    .min(1)
    .max(9999999),
  patchId: z.coerce
    .number({ message: '游戏 ID 必须为数字' })
    .min(1)
    .max(9999999),
  content: z
    .string({ message: '举报原因为必填项' })
    .trim()
    .min(2, { message: '举报原因至少需要 2 个字符' })
    .max(5000, { message: '举报原因最多 5000 个字符' })
})

export const togglePatchFavoriteSchema = z.object({
  patchId: z.coerce
    .number({ message: '游戏 ID 必须为数字' })
    .min(1)
    .max(9999999),
  folderId: z.coerce
    .number({ message: '收藏夹 ID 必须为数字' })
    .min(1)
    .max(9999999)
})

export const patchRatingCreateSchema = z.object({
  patchId: z.coerce
    .number({ message: '游戏 ID 格式不正确' })
    .min(1)
    .max(9999999),
  recommend: z
    .string({ message: '推荐程度不正确' })
    .refine(
      (value) => KUN_GALGAME_RATING_RECOMMEND_CONST.includes(value as any),
      {
        message: '推荐程度不正确'
      }
    ),
  overall: z.coerce
    .number({ message: '评分不正确' })
    .min(1, { message: '评分最小为 1' })
    .max(10, { message: '评分最大为 10' }),
  playStatus: z
    .string({ message: '游玩状态不正确' })
    .refine(
      (value) => KUN_GALGAME_RATING_PLAY_STATUS_CONST.includes(value as any),
      {
        message: '游玩状态不正确'
      }
    ),
  shortSummary: z
    .string({ message: '简评不正确' })
    .trim()
    .max(1314, { message: '简评最多 1314 个字符' }),
  spoilerLevel: z
    .string({ message: '剧透等级不正确' })
    .refine(
      (value) => KUN_GALGAME_RATING_SPOILER_CONST.includes(value as any),
      {
        message: '剧透等级不正确'
      }
    )
})

export const patchRatingUpdateSchema = patchRatingCreateSchema.merge(
  z.object({
    ratingId: z.coerce
      .number({ message: '评分 ID 格式不正确' })
      .min(1)
      .max(9999999)
  })
)
