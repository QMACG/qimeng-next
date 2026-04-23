import { NextRequest, NextResponse } from 'next/server'
import { kunParsePutBody } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import { adminUpdateUserNameStyleConfigSchema } from '~/validations/admin'
import { getUserNameStyleConfig } from './_shared'

const verifyAdmin = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return '用户未登录'
  }
  if (payload.role < 3) {
    return '仅管理员可以访问站点设置'
  }

  return payload
}

export const GET = async (req: NextRequest) => {
  const payload = await verifyAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  const config = await getUserNameStyleConfig()
  return NextResponse.json(config)
}

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(req, adminUpdateUserNameStyleConfigSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  await (prisma as any).site_user_name_style_config.upsert({
    where: { id: 1 },
    update: {
      role_1_color: input.role1Color,
      role_2_color: input.role2Color,
      role_3_color: input.role3Color,
      role_4_color: input.role4Color
    },
    create: {
      id: 1,
      role_1_color: input.role1Color,
      role_2_color: input.role2Color,
      role_3_color: input.role3Color,
      role_4_color: input.role4Color
    }
  })

  return NextResponse.json({})
}
