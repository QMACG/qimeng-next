import type { AdminFrontDisplayConfig } from '~/types/api/admin'

export const DEFAULT_FRONT_DISPLAY_CONFIG: AdminFrontDisplayConfig = {
  hideViewCountForVisitor: true,
  hideDownloadCountForVisitor: true,
  hideCreatorStatsForVisitor: true
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
