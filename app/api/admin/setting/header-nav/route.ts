import { NextRequest, NextResponse } from 'next/server'
import { kunParsePutBody } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import { adminUpdateHeaderNavConfigSchema } from '~/validations/admin'
import { getHeaderNavConfig } from './_shared'

const verifyAdmin = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return '用户未登录'
  }
  if (payload.role < 3) {
    return '仅管理员可以管理页头设置'
  }

  return payload
}

export const GET = async (req: NextRequest) => {
  const payload = await verifyAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  const config = await getHeaderNavConfig()
  return NextResponse.json(config)
}

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(req, adminUpdateHeaderNavConfigSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  await prisma.$transaction(async (tx) => {
    await (tx as any).site_header_nav_item.deleteMany({})

    for (const item of input.items) {
      await (tx as any).site_header_nav_item.create({
        data: {
          nav_key: item.isFixed ? (item.key ?? null) : null,
          name: item.name,
          href: item.href,
          sort_order: item.sortOrder,
          is_fixed: item.isFixed
        }
      })
    }
  })

  const config = await getHeaderNavConfig()
  return NextResponse.json(config)
}
