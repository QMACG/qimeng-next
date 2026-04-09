'use server'

import { z } from 'zod'
import { safeParseSchema } from '~/utils/actions/safeParseSchema'
import { galgameSchema } from '~/validations/galgame'
import { GET as getGalgameRoute } from '~/app/api/galgame/route'
import { callRouteGet } from '~/utils/actions/callRouteHandler'

export const kunGetActions = async (params: z.infer<typeof galgameSchema>) => {
  const input = safeParseSchema(galgameSchema, params)
  if (typeof input === 'string') {
    return input
  }

  const response = await callRouteGet(getGalgameRoute, '/api/galgame', input)
  return response
}
