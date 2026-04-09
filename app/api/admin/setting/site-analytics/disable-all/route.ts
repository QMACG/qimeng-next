import { NextRequest, NextResponse } from 'next/server'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import { clearSiteAnalyticsScriptsCache } from '../_shared'

const siteAnalyticsScript = (prisma as any).site_analytics_script

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

export const POST = async (req: NextRequest) => {
  const payload = await verifyAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  await siteAnalyticsScript.updateMany({
    data: {
      is_enabled: false
    }
  })

  await clearSiteAnalyticsScriptsCache()

  return NextResponse.json({})
}
