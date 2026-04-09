'use server'

import { z } from 'zod'
import { safeParseSchema } from '~/utils/actions/safeParseSchema'
import { commentSchema } from '~/validations/comment'
import { GET as getCommentRoute } from '~/app/api/comment/route'
import { callRouteGet } from '~/utils/actions/callRouteHandler'

export const kunGetActions = async (params: z.infer<typeof commentSchema>) => {
  const input = safeParseSchema(commentSchema, params)
  if (typeof input === 'string') {
    return input
  }

  const response = await callRouteGet(getCommentRoute, '/api/comment', input)
  return response
}
