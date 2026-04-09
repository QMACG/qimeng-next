import { NextRequest, NextResponse } from 'next/server'
import {
  kunParseDeleteQuery,
  kunParsePostBody
} from '~/app/api/utils/parseQuery'
import { prisma } from '~/prisma/index'
import {
  adminDirectDownloadIpBlacklistCreateSchema,
  adminDirectDownloadIpBlacklistDeleteSchema
} from '~/validations/admin'
import { verifyDirectDownloadAdmin } from '../_auth'
import { getAdminDirectDownloadIpBlacklist } from '~/app/api/direct-download/_shared'

export const GET = async (req: NextRequest) => {
  const payload = await verifyDirectDownloadAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  const items = await getAdminDirectDownloadIpBlacklist()
  return NextResponse.json(items)
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(
    req,
    adminDirectDownloadIpBlacklistCreateSchema
  )
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyDirectDownloadAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  const exists = await prisma.site_direct_download_ip_blacklist.findUnique({
    where: { ip: input.ip }
  })
  if (exists) {
    return NextResponse.json('该 IP 已在黑名单中')
  }

  const item = await prisma.site_direct_download_ip_blacklist.create({
    data: {
      ip: input.ip,
      reason: input.reason
    }
  })

  return NextResponse.json({
    id: item.id,
    ip: item.ip,
    reason: item.reason,
    created: String(item.created),
    updated: String(item.updated)
  })
}

export const DELETE = async (req: NextRequest) => {
  const input = kunParseDeleteQuery(
    req,
    adminDirectDownloadIpBlacklistDeleteSchema
  )
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyDirectDownloadAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  await prisma.site_direct_download_ip_blacklist.delete({
    where: { id: input.id }
  })

  return NextResponse.json({})
}
