import { NextRequest, NextResponse } from 'next/server'
import { verifyDirectDownloadAdmin } from '../_auth'
import { getAdminDirectDownloadStatistics } from '~/app/api/direct-download/_shared'

export const GET = async (req: NextRequest) => {
  const payload = await verifyDirectDownloadAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  const response = await getAdminDirectDownloadStatistics()
  return NextResponse.json(response)
}
