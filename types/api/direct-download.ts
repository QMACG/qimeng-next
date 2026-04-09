export interface DirectDownloadPreview {
  file: string
  isLoggedIn: boolean
  canDownload: boolean
  requiresCaptcha: boolean
  rateLimitWindowMinutes: number
  rateLimitMaxCount: number
  message: string
  patch: {
    id: number
    uniqueId: string
    name: string
  } | null
  resource: {
    id: number
    name: string
  } | null
}

export interface DirectDownloadPrepareResponse {
  downloadUrl: string
}

export interface AdminDirectDownloadConfig {
  enableDownload: boolean
  requireCaptcha: boolean
  recordLogs: boolean
  rateLimitWindowMinutes: number
  rateLimitMaxCount: number
  envReady: boolean
  downloadHostsCount: number
}

export interface AdminDirectDownloadLogItem {
  id: number
  filePath: string
  userIp: string
  userAgent: string
  status: string
  reason: string
  created: string
  user: {
    id: number
    name: string
    email: string
  } | null
  patch: {
    id: number
    uniqueId: string
    name: string
  } | null
  resource: {
    id: number
    name: string
  } | null
}

export interface AdminDirectDownloadLogSummary {
  total: number
  success: number
  blocked: number
}

export interface AdminDirectDownloadLogResponse {
  items: AdminDirectDownloadLogItem[]
  total: number
  summary: AdminDirectDownloadLogSummary
}

export interface AdminDirectDownloadIpBlacklistItem {
  id: number
  ip: string
  reason: string
  created: string
  updated: string
}

export interface AdminDirectDownloadUserBlacklistItem {
  id: number
  reason: string
  created: string
  updated: string
  user: {
    id: number
    name: string
    email: string
  }
}

export interface AdminDirectDownloadStatisticsOverview {
  totalRequests: number
  successRequests: number
  blockedRequests: number
  recent24Hours: number
  recent7Days: number
  uniqueUsers: number
  uniquePatches: number
  uniqueIps: number
}

export interface AdminDirectDownloadPatchStatsItem {
  patchId: number
  uniqueId: string
  name: string
  total: number
  success: number
  blocked: number
}

export interface AdminDirectDownloadUserStatsItem {
  userId: number
  name: string
  email: string
  total: number
  success: number
  blocked: number
}

export interface AdminDirectDownloadIpStatsItem {
  userIp: string
  total: number
  success: number
  blocked: number
}

export interface AdminDirectDownloadReasonStatsItem {
  reason: string
  count: number
}

export interface AdminDirectDownloadStatisticsResponse {
  overview: AdminDirectDownloadStatisticsOverview
  topPatches: AdminDirectDownloadPatchStatsItem[]
  topUsers: AdminDirectDownloadUserStatsItem[]
  topIps: AdminDirectDownloadIpStatsItem[]
  blockedReasons: AdminDirectDownloadReasonStatsItem[]
}
