'use server'

import { z } from 'zod'
import { safeParseSchema } from '~/utils/actions/safeParseSchema'
import { getTagSchema } from '~/validations/tag'
import { GET as getTagRoute } from '~/app/api/tag/all/route'
import { callRouteGet } from '~/utils/actions/callRouteHandler'

export const kunGetActions = async (params: z.infer<typeof getTagSchema>) => {
  const input = safeParseSchema(getTagSchema, params)
  if (typeof input === 'string') {
    return input
  }

  const response = await callRouteGet(getTagRoute, '/api/tag/all', input)
  return response
}
