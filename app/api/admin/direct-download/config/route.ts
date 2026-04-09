import { NextRequest, NextResponse } from 'next/server'
import { kunParsePutBody } from '~/app/api/utils/parseQuery'
import { prisma } from '~/prisma/index'
import { adminUpdateDirectDownloadConfigSchema } from '~/validations/admin'
import { verifyDirectDownloadAdmin } from '../_auth'
import { getAdminDirectDownloadConfig } from '~/app/api/direct-download/_shared'

export const GET = async (req: NextRequest) => {
  const payload = await verifyDirectDownloadAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  const config = await getAdminDirectDownloadConfig()
  return NextResponse.json(config)
}

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(
    req,
    adminUpdateDirectDownloadConfigSchema
  )
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyDirectDownloadAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  await prisma.site_direct_download_config.upsert({
    where: { id: 1 },
    update: {
      enable_download: input.enableDownload,
      require_captcha: input.requireCaptcha,
      record_logs: input.recordLogs,
      rate_limit_window_minutes: input.rateLimitWindowMinutes,
      rate_limit_max_count: input.rateLimitMaxCount
    },
    create: {
      id: 1,
      enable_download: input.enableDownload,
      require_captcha: input.requireCaptcha,
      record_logs: input.recordLogs,
      rate_limit_window_minutes: input.rateLimitWindowMinutes,
      rate_limit_max_count: input.rateLimitMaxCount
    }
  })

  return NextResponse.json({})
}
