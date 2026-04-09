'use server'

import { z } from 'zod'
import { getUserInfoSchema } from '~/validations/user'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { safeParseSchema } from '~/utils/actions/safeParseSchema'
import { GET as getUserCommentRoute } from '~/app/api/user/profile/comment/route'
import { callRouteGet } from '~/utils/actions/callRouteHandler'

export const kunGetActions = async (
  params: z.infer<typeof getUserInfoSchema>
) => {
  const input = safeParseSchema(getUserInfoSchema, params)
  if (typeof input === 'string') {
    return input
  }
  const payload = await verifyHeaderCookie()
  if (!payload) {
    return '用户登陆失效'
  }

  const response = await callRouteGet(
    getUserCommentRoute,
    '/api/user/profile/comment',
    input
  )
  return response
}
