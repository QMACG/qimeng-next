import { NextRequest, NextResponse } from 'next/server'
import { kunParsePutBody } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import { adminUpdateFrontDisplaySchema } from '~/validations/admin'
import { getFrontDisplayConfig } from './getFrontDisplayConfig'

export const GET = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 3) {
    return NextResponse.json('当前页面仅管理员可访问')
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
    return NextResponse.json('当前页面仅管理员可访问')
  }

  await prisma.site_front_display_config.upsert({
    where: { id: 1 },
    update: {
      enable_site: input.enableSite,
      site_close_message: input.siteCloseMessage.trim(),
      hide_view_count_for_visitor: input.hideViewCountForVisitor,
      hide_download_count_for_visitor: input.hideDownloadCountForVisitor,
      hide_creator_stats_for_visitor: input.hideCreatorStatsForVisitor,
      enable_content_scope_control: input.enableContentScopeControl,
      enable_patch_related_games: input.enablePatchRelatedGames,
      enable_friend_link_apply: input.enableFriendLinkApply
    },
    create: {
      id: 1,
      enable_site: input.enableSite,
      site_close_message: input.siteCloseMessage.trim(),
      hide_view_count_for_visitor: input.hideViewCountForVisitor,
      hide_download_count_for_visitor: input.hideDownloadCountForVisitor,
      hide_creator_stats_for_visitor: input.hideCreatorStatsForVisitor,
      enable_content_scope_control: input.enableContentScopeControl,
      enable_patch_related_games: input.enablePatchRelatedGames,
      enable_friend_link_apply: input.enableFriendLinkApply
    }
  })

  return NextResponse.json(await getFrontDisplayConfig())
}
