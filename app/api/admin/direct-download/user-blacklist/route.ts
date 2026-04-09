import { NextRequest, NextResponse } from 'next/server'
import {
  kunParseDeleteQuery,
  kunParsePostBody
} from '~/app/api/utils/parseQuery'
import { prisma } from '~/prisma/index'
import {
  adminDirectDownloadUserBlacklistCreateSchema,
  adminDirectDownloadUserBlacklistDeleteSchema
} from '~/validations/admin'
import { verifyDirectDownloadAdmin } from '../_auth'
import { getAdminDirectDownloadUserBlacklist } from '~/app/api/direct-download/_shared'

export const GET = async (req: NextRequest) => {
  const payload = await verifyDirectDownloadAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  const items = await getAdminDirectDownloadUserBlacklist()
  return NextResponse.json(items)
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(
    req,
    adminDirectDownloadUserBlacklistCreateSchema
  )
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyDirectDownloadAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      name: true,
      email: true
    }
  })
  if (!user) {
    return NextResponse.json('未找到对应用户')
  }

  const exists = await prisma.site_direct_download_user_blacklist.findUnique({
    where: { user_id: input.userId }
  })
  if (exists) {
    return NextResponse.json('该用户已在黑名单中')
  }

  const item = await prisma.site_direct_download_user_blacklist.create({
    data: {
      user_id: input.userId,
      reason: input.reason
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })

  return NextResponse.json({
    id: item.id,
    reason: item.reason,
    created: String(item.created),
    updated: String(item.updated),
    user: item.user
  })
}

export const DELETE = async (req: NextRequest) => {
  const input = kunParseDeleteQuery(
    req,
    adminDirectDownloadUserBlacklistDeleteSchema
  )
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyDirectDownloadAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  await prisma.site_direct_download_user_blacklist.delete({
    where: { id: input.id }
  })

  return NextResponse.json({})
}
