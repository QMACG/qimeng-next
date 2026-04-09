'use server'

import { z } from 'zod'
import { safeParseSchema } from '~/utils/actions/safeParseSchema'
import { adminPaginationSchema } from '~/validations/admin'
import { GET as getLogRoute } from '~/app/api/admin/log/route'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { callRouteGet } from '~/utils/actions/callRouteHandler'

export const kunGetActions = async (
  params: z.infer<typeof adminPaginationSchema>
) => {
  const input = safeParseSchema(adminPaginationSchema, params)
  if (typeof input === 'string') {
    return input
  }
  const payload = await verifyHeaderCookie()
  if (!payload) {
    return '用户登录失效'
  }
  if (payload.role < 3) {
    return '本页面仅管理员可访问'
  }

  return callRouteGet(getLogRoute, '/api/admin/log', input)
}
