'use server'

import { z } from 'zod'
import { safeParseSchema } from '~/utils/actions/safeParseSchema'
import { adminReportPaginationSchema } from '~/validations/admin'
import { GET as getReportRoute } from '~/app/api/admin/report/route'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { callRouteGet } from '~/utils/actions/callRouteHandler'

export const kunGetActions = async (
  params: z.infer<typeof adminReportPaginationSchema>
) => {
  const input = safeParseSchema(adminReportPaginationSchema, params)
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

  return callRouteGet(getReportRoute, '/api/admin/report', input)
}
