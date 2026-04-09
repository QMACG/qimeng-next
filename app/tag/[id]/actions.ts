'use server'

import { z } from 'zod'
import { safeParseSchema } from '~/utils/actions/safeParseSchema'
import { getTagById } from '~/app/api/tag/get'
import { GET as getPatchByTagRoute } from '~/app/api/tag/galgame/route'
import { getPatchByTagSchema, getTagByIdSchema } from '~/validations/tag'
import { callRouteGet } from '~/utils/actions/callRouteHandler'

export const kunGetTagByIdActions = async (
  params: z.infer<typeof getTagByIdSchema>
) => {
  const input = safeParseSchema(getTagByIdSchema, params)
  if (typeof input === 'string') {
    return input
  }

  const response = await getTagById(input)
  return response
}

export const kunTagGalgameActions = async (
  params: z.infer<typeof getPatchByTagSchema>
) => {
  const input = safeParseSchema(getPatchByTagSchema, params)
  if (typeof input === 'string') {
    return input
  }

  const response = await callRouteGet(
    getPatchByTagRoute,
    '/api/tag/galgame',
    input
  )
  return response
}
