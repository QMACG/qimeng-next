'use server'

import { z } from 'zod'
import { safeParseSchema } from '~/utils/actions/safeParseSchema'
import { rankingSchema } from '~/validations/ranking'
import { GET as getRankingRoute } from '~/app/api/ranking/route'
import { callRouteGet } from '~/utils/actions/callRouteHandler'

export const kunGetRankingActions = async (
  params: z.infer<typeof rankingSchema>
) => {
  const input = safeParseSchema(rankingSchema, params)
  if (typeof input === 'string') {
    return input
  }

  const response = await callRouteGet(getRankingRoute, '/api/ranking', input)
  return response
}
