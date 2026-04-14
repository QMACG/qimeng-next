import { Prisma } from '~/prisma/generated/prisma/client'
import { prisma } from '~/prisma/index'
import type { AdminFrontDisplayConfig } from '~/types/api/admin'
import { DEFAULT_FRONT_DISPLAY_CONFIG } from '~/utils/frontDisplay'

const FRONT_DISPLAY_CONFIG_ID = 1

const mapFrontDisplayConfig = (config: {
  enable_site: boolean
  site_close_message: string
  hide_view_count_for_visitor: boolean
  hide_download_count_for_visitor: boolean
  hide_creator_stats_for_visitor: boolean
  enable_patch_related_games: boolean
  enable_friend_link_apply: boolean
}): AdminFrontDisplayConfig => ({
  enableSite: config.enable_site,
  siteCloseMessage: config.site_close_message,
  hideViewCountForVisitor: config.hide_view_count_for_visitor,
  hideDownloadCountForVisitor: config.hide_download_count_for_visitor,
  hideCreatorStatsForVisitor: config.hide_creator_stats_for_visitor,
  enablePatchRelatedGames: config.enable_patch_related_games,
  enableFriendLinkApply: config.enable_friend_link_apply
})

const createDefaultFrontDisplayConfig = async () => {
  try {
    return await prisma.site_front_display_config.create({
      data: {
        id: FRONT_DISPLAY_CONFIG_ID,
        enable_site: DEFAULT_FRONT_DISPLAY_CONFIG.enableSite,
        site_close_message: DEFAULT_FRONT_DISPLAY_CONFIG.siteCloseMessage,
        hide_view_count_for_visitor:
          DEFAULT_FRONT_DISPLAY_CONFIG.hideViewCountForVisitor,
        hide_download_count_for_visitor:
          DEFAULT_FRONT_DISPLAY_CONFIG.hideDownloadCountForVisitor,
        hide_creator_stats_for_visitor:
          DEFAULT_FRONT_DISPLAY_CONFIG.hideCreatorStatsForVisitor,
        enable_patch_related_games:
          DEFAULT_FRONT_DISPLAY_CONFIG.enablePatchRelatedGames,
        enable_friend_link_apply:
          DEFAULT_FRONT_DISPLAY_CONFIG.enableFriendLinkApply
      }
    })
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const existing = await prisma.site_front_display_config.findUnique({
        where: { id: FRONT_DISPLAY_CONFIG_ID }
      })

      if (existing) {
        return existing
      }
    }

    throw error
  }
}

export const getFrontDisplayConfig = async (): Promise<AdminFrontDisplayConfig> => {
  const existing = await prisma.site_front_display_config.findUnique({
    where: { id: FRONT_DISPLAY_CONFIG_ID }
  })

  if (existing) {
    return mapFrontDisplayConfig(existing)
  }

  const created = await createDefaultFrontDisplayConfig()
  return mapFrontDisplayConfig(created)
}
