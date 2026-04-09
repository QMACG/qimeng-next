import { NextRequest, NextResponse } from 'next/server'
import { kunParsePutBody } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { setKv } from '~/lib/redis'
import { adminUpdateFrontDisplaySchema } from '~/validations/admin'
import { getFrontDisplayConfig } from './getFrontDisplayConfig'
import type { AdminFrontDisplayConfig } from '~/types/api/admin'

const REDIS_KEY = 'admin:config:front-display'
const CACHE_SECONDS = 365 * 24 * 60 * 60

export const GET = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 3) {
    return NextResponse.json('本页面仅管理员可访问')
  }

  const config = await getFrontDisplayConfig()
  return NextResponse.json(config)
}

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(req, adminUpdateFrontDisplaySchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 3) {
    return NextResponse.json('本页面仅管理员可访问')
  }

  await setKv(
    REDIS_KEY,
    JSON.stringify(input as AdminFrontDisplayConfig),
    CACHE_SECONDS
  )

  return NextResponse.json({})
}
