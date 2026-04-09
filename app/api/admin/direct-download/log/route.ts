import { NextRequest, NextResponse } from 'next/server'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'
import { adminDirectDownloadLogQuerySchema } from '~/validations/admin'
import { verifyDirectDownloadAdmin } from '../_auth'
import { getAdminDirectDownloadLogs } from '~/app/api/direct-download/_shared'

export const GET = async (req: NextRequest) => {
  const input = kunParseGetQuery(req, adminDirectDownloadLogQuerySchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyDirectDownloadAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  const response = await getAdminDirectDownloadLogs(input)
  return NextResponse.json(response)
}
