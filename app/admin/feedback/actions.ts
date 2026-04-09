'use server'

import { z } from 'zod'
import { safeParseSchema } from '~/utils/actions/safeParseSchema'
import { adminFeedbackPaginationSchema } from '~/validations/admin'
import { GET as getFeedbackRoute } from '~/app/api/admin/feedback/route'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { callRouteGet } from '~/utils/actions/callRouteHandler'

export const kunGetActions = async (
  params: z.input<typeof adminFeedbackPaginationSchema>
) => {
  const input = safeParseSchema(adminFeedbackPaginationSchema, params)
  if (typeof input === 'string') {
    return input
  }

  const payload = await verifyHeaderCookie()
  if (!payload) {
    return '用户登录状态已失效'
  }
  if (payload.role < 3) {
    return '当前页面仅管理员可访问'
  }

  return callRouteGet(getFeedbackRoute, '/api/admin/feedback', input)
}
