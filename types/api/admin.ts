import type { PatchResource } from '~/types/api/patch'
import type { PatchComment } from '~/types/api/comment'
import type { Message } from '~/types/api/message'
import type { DocComment, DocPost } from '~/types/api/doc'

export type AdminStatsName =
  | 'user'
  | 'active'
  | 'patch'
  | 'patch_resource'
  | 'patch_comment'

export interface SumData {
  userCount: number
  galgameCount: number
  galgameResourceCount: number
  galgamePatchResourceCount: number
  galgameCommentCount: number
}

export interface OverviewData {
  newUser: number
  newActiveUser: number
  newGalgame: number
  newGalgameResource: number
  newComment: number
}

export interface AdminUser {
  id: number
  name: string
  email: string
  enable2FA: boolean
  bio: string
  avatar: string
  role: number
  status: number
  dailyImageCount: number
  created: Date | string
  _count: {
    patch: number
    patch_resource: number
  }
}

export interface AdminCreator {
  id: number
  content: string
  status: number
  sender: KunUser | null
  patchResourceCount: number
  created: Date | string
}

export interface AdminGalgame {
  id: number
  uniqueId: string
  name: string
  banner: string
  status: number
  user: KunUser
  created: Date | string
}

export interface AdminResource extends PatchResource {
  patchName: string
}

export type AdminDocPost = DocPost

export type AdminComment = PatchComment

export interface AdminFeedback extends DocComment {
  link: string
  sender: KunUser
}

export type AdminReportTargetType = 'comment' | 'rating'

export interface AdminReport extends Message {
  targetType: AdminReportTargetType
  reportedUserId?: number
  reportedCommentId?: number
  reportedRatingId?: number
  reportedUser: KunUser | null
}

export interface AdminLog {
  id: number
  type: string
  user: KunUser
  content: string
  created: Date | string
}

export interface AdminRedirectConfig {
  enableRedirect: boolean
  excludedDomains: string[]
  delaySeconds: number
}

export interface AdminResourceNoteConfig {
  enableNote: boolean
  defaultNote: string
}

export interface AdminFrontDisplayConfig {
  enableSite: boolean
  siteCloseMessage: string
  hideViewCountForVisitor: boolean
  hideDownloadCountForVisitor: boolean
  hideCreatorStatsForVisitor: boolean
  enableContentScopeControl: boolean
  enablePatchRelatedGames: boolean
  enableFriendLinkApply: boolean
}

export interface AdminHomeAnnouncementConfig {
  isEnabled: boolean
  title: string
  content: string
  updatedAt: string | Date
}

export type AdminSiteAnalyticsPosition = 'head' | 'body_end'

export interface AdminSiteAnalyticsScript {
  id: number
  name: string
  position: AdminSiteAnalyticsPosition
  content: string
  isEnabled: boolean
  sortOrder: number
  created: string | Date
  updated: string | Date
}

export interface AdminCommentAuditConfig {
  enableAudit: boolean
  enableUsernameAudit: boolean
  feedbackRequireCaptcha: boolean
  minReviewLength: number
  keywordBlacklist: string[]
  keywordWhitelist: string[]
  userBlacklist: string[]
  userWhitelist: string[]
}

export type AdminHeaderNavFixedKey = 'galgame' | 'tag' | 'company' | 'doc'

export interface AdminHeaderNavItem {
  id: string
  key?: AdminHeaderNavFixedKey
  name: string
  href: string
  sortOrder: number
  isFixed: boolean
}

export interface AdminHeaderNavConfig {
  items: AdminHeaderNavItem[]
}

export interface AdminUserNameStyleConfig {
  role1Color: string
  role2Color: string
  role3Color: string
  role4Color: string
}
