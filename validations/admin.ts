import { z } from 'zod'
import { kunPasswordRegex } from '~/utils/validate'
import { createHttpUrlOrPathSchema } from './shared'

export const adminReportTargetTypeSchema = z.enum(['comment', 'rating'])

export const adminPaginationSchema = z.object({
  page: z.coerce.number().min(1).max(9999999),
  limit: z.coerce.number().min(1).max(100),
  search: z
    .string()
    .max(300, { message: '搜索关键词不能超过 300 个字符' })
    .optional()
})

export const adminUserSearchTypeSchema = z.enum(['name', 'email', 'id'])

export const adminUserPaginationSchema = adminPaginationSchema.extend({
  searchType: adminUserSearchTypeSchema.default('name')
})

export const adminCommentSearchTypeSchema = z.enum(['content', 'user'])
const adminCommentDeleteLimit = 30

export const adminCommentPaginationSchema = adminPaginationSchema.extend({
  searchType: adminCommentSearchTypeSchema.default('content')
})

export const adminFeedbackSearchTypeSchema = z.enum(['content', 'user'])
export const adminFeedbackStatusSchema = z.enum([
  'all',
  'pending',
  'in_progress',
  'resolved',
  'suspended',
  'closed'
])

export const adminFeedbackPaginationSchema = adminPaginationSchema.extend({
  searchType: adminFeedbackSearchTypeSchema.default('content'),
  status: adminFeedbackStatusSchema.default('all')
})

export const adminGalgameStatusSchema = z.enum([
  'all',
  'draft',
  'public',
  'hidden',
  'private'
])

export const adminGalgamePaginationSchema = adminPaginationSchema.extend({
  status: adminGalgameStatusSchema.default('all')
})

const adminCommentIdsSchema = z
  .string()
  .trim()
  .min(1, { message: '至少选择一条评论' })
  .refine(
    (value) =>
      value.split(',').every((item) => {
        const trimmed = item.trim()
        if (!/^\d+$/.test(trimmed)) {
          return false
        }

        const commentId = Number.parseInt(trimmed, 10)
        return commentId >= 1 && commentId <= 9999999
      }),
    { message: '评论 ID 格式不正确' }
  )
  .transform((value) => [
    ...new Set(
      value
        .split(',')
        .map((item) => Number.parseInt(item.trim(), 10))
        .filter((commentId) => commentId >= 1 && commentId <= 9999999)
    )
  ])
  .refine((commentIds) => commentIds.length <= adminCommentDeleteLimit, {
    message: `单次最多删除 ${adminCommentDeleteLimit} 条评论`
  })

export const adminDeleteCommentSchema = z.union([
  z
    .object({
      commentId: z.coerce
        .number({ message: '评论 ID 必须为数字' })
        .min(1)
        .max(9999999)
    })
    .transform(({ commentId }) => ({
      commentIds: [commentId]
    })),
  z
    .object({
      commentIds: adminCommentIdsSchema
    })
    .transform(({ commentIds }) => ({
      commentIds
    }))
])

export const adminReportPaginationSchema = adminPaginationSchema.extend({
  tab: z.enum(['pending', 'handled']).default('pending'),
  targetType: adminReportTargetTypeSchema.default('comment')
})

export const adminUpdateUserSchema = z.object({
  uid: z.coerce.number().min(1).max(9999999),
  name: z
    .string()
    .trim()
    .min(1, { message: '用户名长度至少为 1 个字符' })
    .max(17, { message: '用户名长度不能超过 17 个字符' }),
  email: z.string().trim().email({ message: '请输入有效的邮箱地址' }),
  role: z.coerce.number().min(1).max(4),
  status: z.coerce.number().min(0).max(2),
  dailyImageCount: z.coerce.number().min(0).max(50),
  password: z.preprocess(
    (value) => {
      if (typeof value !== 'string') {
        return value
      }

      const trimmedValue = value.trim()
      return trimmedValue ? trimmedValue : undefined
    },
    z
      .string()
      .regex(kunPasswordRegex, {
        message:
          '新密码格式不正确。密码长度需在 6 到 1007 位之间，且至少包含一个字母和一个数字'
      })
      .optional()
  ),
  bio: z.string().trim().max(107, { message: '个人简介不能超过 107 个字符' })
})

export const adminDisableUser2FASchema = z.object({
  uid: z.coerce.number({ message: '用户 ID 必须为数字' }).min(1).max(9999999)
})

export const approveCreatorSchema = z.object({
  messageId: z.coerce.number().min(1).max(9999999),
  uid: z.coerce.number().min(1).max(9999999)
})

export const declineCreatorSchema = z.object({
  messageId: z.coerce.number().min(1).max(9999999),
  reason: z
    .string()
    .trim()
    .min(1)
    .max(1007, { message: '拒绝原因不能超过 1007 个字符' })
})

export const adminSendEmailSchema = z.object({
  templateId: z.string(),
  variables: z.record(z.string(), z.string())
})

export const adminHandleFeedbackSchema = z.object({
  messageId: z.coerce.number().min(1).max(9999999),
  content: z
    .string()
    .trim()
    .max(5000, { message: '回复内容不能超过 5000 个字符' })
})

export const adminHandleReportSchema = z.object({
  messageId: z.coerce.number().min(1).max(9999999),
  action: z.enum(['delete', 'reject']),
  targetType: adminReportTargetTypeSchema.default('comment'),
  targetId: z.coerce.number().min(1).max(9999999).optional(),
  content: z
    .string()
    .trim()
    .max(5000, { message: '处理结果不能超过 5000 个字符' })
})

export const approvePatchResourceSchema = z.object({
  resourceId: z.coerce.number().min(1).max(9999999)
})

export const declinePatchResourceSchema = z.object({
  resourceId: z.coerce.number().min(1).max(9999999),
  reason: z
    .string()
    .trim()
    .min(1)
    .max(1007, { message: '拒绝原因不能超过 1007 个字符' })
})

export const adminUpdateRedirectSchema = z.object({
  enableRedirect: z.coerce.boolean(),
  excludedDomains: z.array(
    z.string().max(500, { message: '单个域名不能超过 500 个字符' })
  ),
  delaySeconds: z.coerce.number()
})

export const adminUpdateDisableRegisterSchema = z.object({
  disableRegister: z.boolean()
})

export const adminUpdateFrontDisplaySchema = z.object({
  enableSite: z.coerce.boolean(),
  siteCloseMessage: z.string().max(10007),
  hideViewCountForVisitor: z.coerce.boolean(),
  hideDownloadCountForVisitor: z.coerce.boolean(),
  hideCreatorStatsForVisitor: z.coerce.boolean()
}).superRefine((data, ctx) => {
  if (!data.enableSite && !data.siteCloseMessage.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '关闭站点时请填写站点提示',
      path: ['siteCloseMessage']
    })
  }
})

export const adminUpdateResourceNoteSchema = z.object({
  enableNote: z.coerce.boolean(),
  defaultNote: z
    .string()
    .trim()
    .max(20000, { message: '默认资源备注最多 20000 个字符' })
})

export const adminUpdateDirectDownloadConfigSchema = z.object({
  enableDownload: z.coerce.boolean(),
  requireCaptcha: z.coerce.boolean(),
  recordLogs: z.coerce.boolean(),
  rateLimitWindowMinutes: z.coerce
    .number()
    .int()
    .min(0, { message: '限额时间窗口不能小于 0 分钟' })
    .max(1440, { message: '限额时间窗口不能超过 1440 分钟' }),
  rateLimitMaxCount: z.coerce
    .number()
    .int()
    .min(0, { message: '下载次数上限不能小于 0' })
    .max(1000, { message: '下载次数上限不能超过 1000' })
})

export const adminDirectDownloadLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(999999).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(300).optional(),
  patchKeyword: z.string().trim().max(300).optional(),
  userKeyword: z.string().trim().max(300).optional(),
  status: z.enum(['all', 'success', 'blocked']).default('all')
})

export const adminDirectDownloadIpBlacklistCreateSchema = z.object({
  ip: z
    .string()
    .trim()
    .min(1, { message: '请输入要拉黑的 IP' })
    .max(64, { message: 'IP 长度不能超过 64 个字符' }),
  reason: z
    .string()
    .trim()
    .max(1007, { message: '备注不能超过 1007 个字符' })
    .default('')
})

export const adminDirectDownloadIpBlacklistDeleteSchema = z.object({
  id: z.coerce.number().int().min(1).max(9999999)
})

export const adminDirectDownloadUserBlacklistCreateSchema = z.object({
  userId: z.coerce.number().int().min(1).max(9999999),
  reason: z
    .string()
    .trim()
    .max(1007, { message: '备注不能超过 1007 个字符' })
    .default('')
})

export const adminDirectDownloadUserBlacklistDeleteSchema = z.object({
  id: z.coerce.number().int().min(1).max(9999999)
})

export const adminSiteAnalyticsPositionSchema = z.enum(['head', 'body_end'])

export const adminCreateSiteAnalyticsScriptSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: '统计名称不能为空' })
    .max(255, { message: '统计名称不能超过 255 个字符' }),
  position: adminSiteAnalyticsPositionSchema.default('body_end'),
  content: z
    .string()
    .trim()
    .min(1, { message: '统计代码不能为空' })
    .max(50000, { message: '统计代码不能超过 50000 个字符' }),
  isEnabled: z.coerce.boolean(),
  sortOrder: z.coerce
    .number()
    .int()
    .min(0, { message: '排序值不能小于 0' })
    .max(999999, { message: '排序值不能超过 999999' })
})

export const adminUpdateSiteAnalyticsScriptSchema =
  adminCreateSiteAnalyticsScriptSchema.extend({
    id: z.coerce.number().int().min(1).max(9999999)
  })

export const adminDeleteSiteAnalyticsScriptSchema = z.object({
  id: z.coerce.number().int().min(1).max(9999999)
})

const auditKeywordListSchema = z.array(
  z
    .string()
    .trim()
    .min(1, { message: '名单项不能为空' })
    .max(100, { message: '单个名单项不能超过 100 个字符' })
)

export const adminUpdateCommentAuditConfigSchema = z.object({
  enableAudit: z.coerce.boolean(),
  enableUsernameAudit: z.coerce.boolean(),
  feedbackRequireCaptcha: z.coerce.boolean(),
  minReviewLength: z.coerce
    .number()
    .int()
    .min(0, { message: '云审核触发字数不能小于 0' })
    .max(10000, { message: '云审核触发字数不能超过 10000' }),
  keywordBlacklist: auditKeywordListSchema.max(1000, {
    message: '关键词黑名单最多 1000 项'
  }),
  keywordWhitelist: auditKeywordListSchema.max(1000, {
    message: '关键词白名单最多 1000 项'
  }),
  userBlacklist: auditKeywordListSchema.max(1000, {
    message: '用户黑名单最多 1000 项'
  }),
  userWhitelist: auditKeywordListSchema.max(1000, {
    message: '用户白名单最多 1000 项'
  })
})

const adminHeaderNavFixedKeySchema = z.enum(['galgame', 'tag', 'company', 'doc'])

export const adminUpdateHeaderNavConfigSchema = z
  .object({
    items: z
      .array(
        z.object({
          id: z
            .string()
            .trim()
            .min(1, { message: '导航项 ID 不能为空' })
            .max(100, { message: '导航项 ID 不能超过 100 个字符' }),
          key: adminHeaderNavFixedKeySchema.optional(),
          name: z
            .string()
            .trim()
            .min(1, { message: '导航名称不能为空' })
            .max(30, { message: '导航名称不能超过 30 个字符' }),
          href: createHttpUrlOrPathSchema('请输入有效的导航链接'),
          sortOrder: z.coerce
            .number()
            .int()
            .min(0, { message: '排序值不能小于 0' })
            .max(999999, { message: '排序值不能超过 999999' }),
          isFixed: z.coerce.boolean()
        })
      )
      .max(50, { message: '页头导航最多 50 项' })
  })
  .superRefine((value, ctx) => {
    const fixedKeys = value.items
      .filter((item) => item.isFixed)
      .map((item) => item.key)
      .filter((item): item is z.infer<typeof adminHeaderNavFixedKeySchema> =>
        Boolean(item)
      )

    const requiredKeys = adminHeaderNavFixedKeySchema.options

    for (const key of requiredKeys) {
      const count = fixedKeys.filter((item) => item === key).length
      if (count !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '固定导航项配置不完整，请保留游戏资源、游戏标签、会社、文章这四项'
        })
        return
      }
    }

    for (const item of value.items) {
      if (item.isFixed && !item.key) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '固定导航项缺少标识'
        })
        return
      }

      if (!item.isFixed && item.key) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '自定义导航项不能绑定固定标识'
        })
        return
      }
    }
  })

const colorSchema = z
  .string()
  .trim()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
    message: '颜色值格式不正确，请使用十六进制颜色值'
  })

export const adminUpdateUserNameStyleConfigSchema = z.object({
  role1Color: colorSchema,
  role2Color: colorSchema,
  role3Color: colorSchema,
  role4Color: colorSchema
})

export const adminDocCategorySchema = z
  .string()
  .trim()
  .min(1, { message: '文章目录不能为空' })
  .max(120, { message: '文章目录不能超过 120 个字符' })
  .regex(/^[a-z0-9/-]+$/, {
    message: '文章目录只能包含小写字母、数字、斜杠和短横线'
  })

export const adminDocPaginationSchema = adminPaginationSchema.extend({
  category: adminDocCategorySchema.optional()
})

export const adminDocCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: '文章标题不能为空' })
    .max(255, { message: '文章标题不能超过 255 个字符' }),
  directoryLabel: z
    .string()
    .trim()
    .min(1, { message: '目录名称不能为空' })
    .max(255, { message: '目录名称不能超过 255 个字符' }),
  slug: z
    .string()
    .trim()
    .min(1, { message: '文章路径不能为空' })
    .max(255, { message: '文章路径不能超过 255 个字符' })
    .regex(/^[a-z0-9/-]+$/, {
      message: '文章路径只能包含小写字母、数字、斜杠和短横线'
    }),
  banner: createHttpUrlOrPathSchema('请输入有效的封面链接或站内路径'),
  description: z
    .string()
    .trim()
    .max(1007, { message: '文章摘要不能超过 1007 个字符' }),
  content: z
    .string()
    .trim()
    .min(1, { message: '文章正文不能为空' })
    .max(200000, { message: '文章正文不能超过 200000 个字符' }),
  category: adminDocCategorySchema.default('article'),
  status: z.coerce.number().min(0).max(3),
  pin: z.coerce.boolean(),
  sortOrder: z.coerce.number().min(0).max(999999),
  publishedAt: z
    .string()
    .trim()
    .min(1, { message: '请选择发布时间' })
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: '发布时间格式不正确'
    })
})

export const adminDocUpdateSchema = adminDocCreateSchema.extend({
  id: z.coerce.number().min(1).max(9999999)
})

export const adminDocDeleteSchema = z.object({
  id: z.coerce.number().min(1).max(9999999)
})
