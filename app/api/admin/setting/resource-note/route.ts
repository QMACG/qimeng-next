import { NextRequest, NextResponse } from 'next/server'
import { kunParsePutBody } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import { adminUpdateResourceNoteSchema } from '~/validations/admin'
import { getResourceNoteConfig } from './getResourceNoteConfig'

export const GET = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 3) {
    return NextResponse.json('仅管理员可以访问站点设置')
  }

  const config = await getResourceNoteConfig()
  return NextResponse.json(config)
}

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(req, adminUpdateResourceNoteSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 3) {
    return NextResponse.json('仅管理员可以访问站点设置')
  }

  await prisma.site_resource_note_config.upsert({
    where: { id: 1 },
    update: {
      enable_note: input.enableNote,
      default_note: input.defaultNote
    },
    create: {
      id: 1,
      enable_note: input.enableNote,
      default_note: input.defaultNote
    }
  })

  return NextResponse.json({})
}
