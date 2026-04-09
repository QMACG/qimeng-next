'use server'

import { z } from 'zod'
import { safeParseSchema } from '~/utils/actions/safeParseSchema'
import { getMessageSchema } from '~/validations/message'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { GET as getMessageRoute } from '~/app/api/message/all/route'
import { callRouteGet } from '~/utils/actions/callRouteHandler'

export const kunGetActions = async (
  params: z.infer<typeof getMessageSchema>
) => {
  const input = safeParseSchema(getMessageSchema, params)
  if (typeof input === 'string') {
    return input
  }
  const payload = await verifyHeaderCookie()
  if (!payload) {
    return '用户登陆失效'
  }

  const response = await callRouteGet(
    getMessageRoute,
    '/api/message/all',
    input
  )
  return response
}
