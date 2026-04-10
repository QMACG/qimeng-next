import { z } from 'zod'

export const getDocCommentSchema = z.object({
  docPostId: z.coerce.number().min(1).max(9999999),
  page: z.coerce.number().min(1).max(9999999),
  limit: z.coerce.number().min(1).max(50)
})

export const docCommentCreateSchema = z.object({
  docPostId: z.coerce.number().min(1).max(9999999),
  parentId: z.coerce.number().min(1).max(9999999).nullable().optional(),
  captcha: z.string().trim().max(128).optional(),
  content: z
    .string()
    .trim()
    .min(1, { message: '评论内容至少需要 1 个字符' })
    .max(10007, { message: '评论内容最多 10007 个字符' })
})

export const docCommentUpdateSchema = z.object({
  commentId: z.coerce.number().min(1).max(9999999),
  content: z
    .string()
    .trim()
    .min(1, { message: '评论内容至少需要 1 个字符' })
    .max(10007, { message: '评论内容最多 10007 个字符' })
})

export const docCommentDeleteSchema = z.object({
  commentId: z.coerce.number().min(1).max(9999999)
})

export const adminHandleFeedbackCommentSchema = z.object({
  commentId: z.coerce.number().min(1).max(9999999),
  status: z.enum(['in_progress', 'resolved', 'suspended', 'closed']),
  content: z
    .string()
    .trim()
    .max(5000, { message: '回复内容不能超过 5000 个字符' })
    .optional()
    .default('')
})
