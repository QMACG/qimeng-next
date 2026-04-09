import { NextRequest, NextResponse } from 'next/server'
import {
  kunParseDeleteQuery,
  kunParsePostBody,
  kunParsePutBody
} from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import {
  adminCreateSiteAnalyticsScriptSchema,
  adminDeleteSiteAnalyticsScriptSchema,
  adminUpdateSiteAnalyticsScriptSchema
} from '~/validations/admin'
import {
  clearSiteAnalyticsScriptsCache,
  getAdminSiteAnalyticsScripts
} from './_shared'

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

export const GET = async (req: NextRequest) => {
  const payload = await verifyAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  return NextResponse.json(await getAdminSiteAnalyticsScripts())
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(
    req,
    adminCreateSiteAnalyticsScriptSchema
  )
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  const created = await siteAnalyticsScript.create({
    data: {
      name: input.name,
      position: input.position,
      content: input.content,
      is_enabled: input.isEnabled,
      sort_order: input.sortOrder
    }
  })

  await clearSiteAnalyticsScriptsCache()

  return NextResponse.json({
    id: created.id,
    name: created.name,
    position: created.position,
    content: created.content,
    isEnabled: created.is_enabled,
    sortOrder: created.sort_order,
    created: String(created.created),
    updated: String(created.updated)
  })
}

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(req, adminUpdateSiteAnalyticsScriptSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  const updated = await siteAnalyticsScript.update({
    where: { id: input.id },
    data: {
      name: input.name,
      position: input.position,
      content: input.content,
      is_enabled: input.isEnabled,
      sort_order: input.sortOrder
    }
  })

  await clearSiteAnalyticsScriptsCache()

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    position: updated.position,
    content: updated.content,
    isEnabled: updated.is_enabled,
    sortOrder: updated.sort_order,
    created: String(updated.created),
    updated: String(updated.updated)
  })
}

export const DELETE = async (req: NextRequest) => {
  const input = kunParseDeleteQuery(req, adminDeleteSiteAnalyticsScriptSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  await siteAnalyticsScript.delete({
    where: { id: input.id }
  })

  await clearSiteAnalyticsScriptsCache()

  return NextResponse.json({})
}
