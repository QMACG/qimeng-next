import type { AdminFrontDisplayConfig } from '~/types/api/admin'

export const DEFAULT_FRONT_DISPLAY_CONFIG: AdminFrontDisplayConfig = {
  enableSite: true,
  siteCloseMessage:
    '站点正在维护或调整中，请稍后再访问。\n\n如需了解最新进度，请关注站内公告或稍后刷新页面。',
  hideViewCountForVisitor: true,
  hideDownloadCountForVisitor: true,
  hideCreatorStatsForVisitor: true,
  enableContentScopeControl: true,
  enablePatchRelatedGames: true,
  enableFriendLinkApply: true
}

export const canShowViewCount = (
  role: number,
  config: AdminFrontDisplayConfig
) => role >= 2 || !config.hideViewCountForVisitor

export const canShowDownloadCount = (
  role: number,
  config: AdminFrontDisplayConfig
) => role >= 2 || !config.hideDownloadCountForVisitor

export const canShowCreatorStats = (
  role: number,
  config: AdminFrontDisplayConfig
) => role >= 2 || !config.hideCreatorStatsForVisitor

export const shouldBypassGuestContentScope = (
  uid: number,
  config: AdminFrontDisplayConfig
) => uid <= 0 && !config.enableContentScopeControl

export const resolvePublicNsfwFilter = (
  nsfwFilter: Record<string, string | undefined>,
  uid: number,
  config: AdminFrontDisplayConfig
) => (shouldBypassGuestContentScope(uid, config) ? {} : nsfwFilter)

export const shouldBlurRestrictedCoverForGuest = (
  uid: number,
  contentLimit: string,
  config: AdminFrontDisplayConfig
) => shouldBypassGuestContentScope(uid, config) && contentLimit === 'nsfw'
