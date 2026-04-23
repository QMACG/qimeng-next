import { NextRequest, NextResponse } from 'next/server'
import { kunParsePutBody } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import { adminUpdateHomeAnnouncementConfigSchema } from '~/validations/admin'
import { getHomeAnnouncementConfig } from './getHomeAnnouncementConfig'

export const GET = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 3) {
    return NextResponse.json('当前页面仅管理员可访问')
  }

  return NextResponse.json(await getHomeAnnouncementConfig())
}

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(
    req,
    adminUpdateHomeAnnouncementConfigSchema
  )
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 3) {
    return NextResponse.json('当前页面仅管理员可访问')
  }

  await prisma.site_home_announcement_config.upsert({
    where: { id: 1 },
    update: {
      is_enabled: input.isEnabled,
      title: input.title.trim() || '站点公告',
      content: input.content.trim()
    },
    create: {
      id: 1,
      is_enabled: input.isEnabled,
      title: input.title.trim() || '站点公告',
      content: input.content.trim()
    }
  })

  return NextResponse.json(await getHomeAnnouncementConfig())
}
