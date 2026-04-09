'use server'

import { z } from 'zod'
import { safeParseSchema } from '~/utils/actions/safeParseSchema'
import { adminDocPaginationSchema } from '~/validations/admin'
import { GET as getAdminDocRoute } from '~/app/api/admin/doc/route'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { callRouteGet } from '~/utils/actions/callRouteHandler'

export const kunGetActions = async (
  params: z.infer<typeof adminDocPaginationSchema>
) => {
  const input = safeParseSchema(adminDocPaginationSchema, params)
  if (typeof input === 'string') {
    return input
  }

  const payload = await verifyHeaderCookie()
  if (!payload) {
    return '用户登录失效'
  }
  if (payload.role < 2) {
    return '仅编辑及以上角色可以访问后台文章管理'
  }

  return callRouteGet(getAdminDocRoute, '/api/admin/doc', input)
}
