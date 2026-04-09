import { prisma } from '~/prisma/index'
import type { AdminCommentAuditConfig } from '~/types/api/admin'
import { parseJsonStringArray, toJsonStringArray } from '~/utils/prismaJson'

export const DEFAULT_COMMENT_AUDIT_CONFIG: AdminCommentAuditConfig = {
  enableAudit: false,
  enableUsernameAudit: true,
  feedbackRequireCaptcha: false,
  minReviewLength: 5,
  keywordBlacklist: [],
  keywordWhitelist: [],
  userBlacklist: [],
  userWhitelist: []
}

const mapConfig = (config: {
  enable_audit: boolean
  enable_username_audit: boolean
  feedback_require_captcha: boolean
  min_review_length: number
  keyword_blacklist: unknown
  keyword_whitelist: unknown
  user_blacklist: unknown
  user_whitelist: unknown
}): AdminCommentAuditConfig => ({
  enableAudit: config.enable_audit,
  enableUsernameAudit: config.enable_username_audit,
  feedbackRequireCaptcha: config.feedback_require_captcha,
  minReviewLength: config.min_review_length,
  keywordBlacklist: parseJsonStringArray(config.keyword_blacklist as any),
  keywordWhitelist: parseJsonStringArray(config.keyword_whitelist as any),
  userBlacklist: parseJsonStringArray(config.user_blacklist as any),
  userWhitelist: parseJsonStringArray(config.user_whitelist as any)
})

export const getCommentAuditConfig = async (): Promise<AdminCommentAuditConfig> => {
  const config = await (prisma as any).site_content_audit_config.findUnique({
    where: { id: 1 }
  })

  if (!config) {
    const created = await (prisma as any).site_content_audit_config.create({
      data: {
        id: 1,
        enable_audit: DEFAULT_COMMENT_AUDIT_CONFIG.enableAudit,
        enable_username_audit: DEFAULT_COMMENT_AUDIT_CONFIG.enableUsernameAudit,
        feedback_require_captcha:
          DEFAULT_COMMENT_AUDIT_CONFIG.feedbackRequireCaptcha,
        min_review_length: DEFAULT_COMMENT_AUDIT_CONFIG.minReviewLength,
        keyword_blacklist: toJsonStringArray(
          DEFAULT_COMMENT_AUDIT_CONFIG.keywordBlacklist
        ),
        keyword_whitelist: toJsonStringArray(
          DEFAULT_COMMENT_AUDIT_CONFIG.keywordWhitelist
        ),
        user_blacklist: toJsonStringArray(DEFAULT_COMMENT_AUDIT_CONFIG.userBlacklist),
        user_whitelist: toJsonStringArray(DEFAULT_COMMENT_AUDIT_CONFIG.userWhitelist)
      }
    })

    return mapConfig(created)
  }

  return mapConfig(config)
}
