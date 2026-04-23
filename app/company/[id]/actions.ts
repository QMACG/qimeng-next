'use server'

import { z } from 'zod'
import { safeParseSchema } from '~/utils/actions/safeParseSchema'
import { GET as getCompanyByIdRoute } from '~/app/api/company/route'
import { GET as getPatchByCompanyRoute } from '~/app/api/company/galgame/route'
import {
  getCompanyByIdSchema,
  getPatchByCompanySchema
} from '~/validations/company'
import { callRouteGet } from '~/utils/actions/callRouteHandler'

export const kunGetCompanyByIdActions = async (
  params: z.infer<typeof getCompanyByIdSchema>
) => {
  const input = safeParseSchema(getCompanyByIdSchema, params)
  if (typeof input === 'string') {
    return input
  }

  const response = await callRouteGet(
    getCompanyByIdRoute,
    '/api/company',
    input
  )
  return response
}

export const kunCompanyGalgameActions = async (
  params: z.infer<typeof getPatchByCompanySchema>
) => {
  const input = safeParseSchema(getPatchByCompanySchema, params)
  if (typeof input === 'string') {
    return input
  }

  const response = await callRouteGet(
    getPatchByCompanyRoute,
    '/api/company/galgame',
    input
  )
  return response
}
