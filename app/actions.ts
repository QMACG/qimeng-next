'use server'

import { setKUNGalgameTask } from '~/server/cron'

setKUNGalgameTask()

import { GET as getHomeRoute } from '~/app/api/home/route'
import { callRouteGet } from '~/utils/actions/callRouteHandler'

export const kunGetActions = async () => {
  const response = await callRouteGet(getHomeRoute, '/api/home')
  return response
}
