'use server'

import { z } from 'zod'
import { safeParseSchema } from '~/utils/actions/safeParseSchema'
import {
  getConversationsSchema,
  getConversationMessagesSchema
} from '~/validations/conversation'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { GET as getConversationsRoute } from '~/app/api/message/conversation/route'
import { GET as getConversationMessagesRoute } from '~/app/api/message/conversation/[id]/route'
import {
  callRouteGet,
  callRouteGetWithParams
} from '~/utils/actions/callRouteHandler'

export const kunGetConversationsAction = async (
  params: z.infer<typeof getConversationsSchema>
) => {
  const input = safeParseSchema(getConversationsSchema, params)
  if (typeof input === 'string') {
    return input
  }
  const payload = await verifyHeaderCookie()
  if (!payload) {
    return '用户登录失效'
  }

  const response = await callRouteGet(
    getConversationsRoute,
    '/api/message/conversation',
    input
  )
  return response
}

export const kunGetConversationMessagesAction = async (
  conversationId: number,
  params: z.infer<typeof getConversationMessagesSchema>
) => {
  const input = safeParseSchema(getConversationMessagesSchema, params)
  if (typeof input === 'string') {
    return input
  }
  const payload = await verifyHeaderCookie()
  if (!payload) {
    return '用户登录失效'
  }

  const response = await callRouteGetWithParams(
    getConversationMessagesRoute,
    `/api/message/conversation/${conversationId}`,
    { id: String(conversationId) },
    input,
  )
  return response
}
