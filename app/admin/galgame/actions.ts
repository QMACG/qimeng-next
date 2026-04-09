'use server'

import { z } from 'zod'
import { safeParseSchema } from '~/utils/actions/safeParseSchema'
import { adminPaginationSchema } from '~/validations/admin'
import { GET as getAdminGalgameRoute } from '~/app/api/admin/galgame/route'
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
  if (payload.role < 2) {
    return '仅编辑及以上角色可以访问后台管理'
  }

  return callRouteGet(getAdminGalgameRoute, '/api/admin/galgame', input)
}
