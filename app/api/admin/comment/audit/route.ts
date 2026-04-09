import { NextRequest, NextResponse } from 'next/server'
import { kunParsePutBody } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import { adminUpdateCommentAuditConfigSchema } from '~/validations/admin'
import { getCommentAuditConfig } from './_shared'
import { toJsonStringArray } from '~/utils/prismaJson'

const verifyAdmin = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return '用户未登录'
  }
  if (payload.role < 3) {
    return '仅管理员可以访问评论审核设置'
  }

  return payload
}

export const GET = async (req: NextRequest) => {
  const payload = await verifyAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  const config = await getCommentAuditConfig()
  return NextResponse.json(config)
}

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(req, adminUpdateCommentAuditConfigSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyAdmin(req)
  if (typeof payload === 'string') {
    return NextResponse.json(payload)
  }

  await (prisma as any).site_content_audit_config.upsert({
    where: { id: 1 },
    update: {
      enable_audit: input.enableAudit,
      enable_username_audit: input.enableUsernameAudit,
      min_review_length: input.minReviewLength,
      keyword_blacklist: toJsonStringArray(input.keywordBlacklist),
      keyword_whitelist: toJsonStringArray(input.keywordWhitelist),
      user_blacklist: toJsonStringArray(input.userBlacklist),
      user_whitelist: toJsonStringArray(input.userWhitelist)
    },
    create: {
      id: 1,
      enable_audit: input.enableAudit,
      enable_username_audit: input.enableUsernameAudit,
      min_review_length: input.minReviewLength,
      keyword_blacklist: toJsonStringArray(input.keywordBlacklist),
      keyword_whitelist: toJsonStringArray(input.keywordWhitelist),
      user_blacklist: toJsonStringArray(input.userBlacklist),
      user_whitelist: toJsonStringArray(input.userWhitelist)
    }
  })

  return NextResponse.json({})
}

