import crypto from 'crypto'
import { getCommentAuditConfig } from '~/app/api/admin/comment/audit/_shared'

type AuditScenario = 'comment' | 'rating' | 'username'

interface AuditIdentity {
  uid?: number | null
  username?: string | null
}

interface AuditParams {
  content: string
  scenario: AuditScenario
  identity?: AuditIdentity
}

interface AliyunAuditResponse {
  Data?: {
    RiskLevel?: string
  }
}

const DEFAULT_ENDPOINT = 'https://green-cip.cn-beijing.aliyuncs.com'
const DEFAULT_AUDIT_ERROR = '内容提交失败，请调整后重试'
const DEFAULT_SERVICE_ERROR = '内容审核服务暂时不可用，请稍后再试'

const splitRules = (items: string[]) => [
  ...new Set(items.map((item) => item.trim()).filter(Boolean))
]

const normalizeText = (value: string) => value.trim().toLowerCase()

const matchesUserRule = (
  rules: string[],
  identity?: AuditIdentity
): boolean => {
  if (!identity) {
    return false
  }

  const normalizedName = identity.username
    ? normalizeText(identity.username)
    : undefined
  const normalizedUid =
    typeof identity.uid === 'number' && identity.uid > 0
      ? String(identity.uid)
      : undefined

  return rules.some((rule) => {
    const normalizedRule = normalizeText(rule)
    if (!normalizedRule) {
      return false
    }

    return normalizedRule === normalizedName || normalizedRule === normalizedUid
  })
}

const findMatchedKeyword = (
  keywords: string[],
  content: string
): string | null => {
  const normalizedContent = normalizeText(content)

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword)
    if (normalizedKeyword && normalizedContent.includes(normalizedKeyword)) {
      return keyword
    }
  }

  return null
}

const percentEncode = (value: string) =>
  encodeURIComponent(value)
    .replace(/\+/g, '%20')
    .replace(/\*/g, '%2A')
    .replace(/%7E/g, '~')

const buildAliyunSignedUrl = (
  endpoint: string,
  accessKeyId: string,
  accessKeySecret: string,
  content: string
) => {
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  const params = new URLSearchParams({
    AccessKeyId: accessKeyId,
    Action: 'TextModerationPlus',
    Format: 'JSON',
    SignatureMethod: 'HMAC-SHA1',
    SignatureNonce: crypto.randomUUID(),
    SignatureVersion: '1.0',
    Timestamp: timestamp,
    Version: '2022-03-02',
    Service: 'comment_detection_pro',
    ServiceParameters: JSON.stringify({ content })
  })

  const sortedPairs = [...params.entries()].sort(([left], [right]) =>
    left.localeCompare(right)
  )
  const canonicalQueryString = sortedPairs
    .map(([key, value]) => `${percentEncode(key)}=${percentEncode(value)}`)
    .join('&')
  const stringToSign = `POST&%2F&${percentEncode(canonicalQueryString)}`
  const signature = crypto
    .createHmac('sha1', `${accessKeySecret}&`)
    .update(stringToSign)
    .digest('base64')

  params.set('Signature', signature)
  return `${endpoint}/?${params.toString()}`
}

const auditByAliyun = async (content: string) => {
  const accessKeyId = process.env.ALIYUN_GREEN_ACCESS_KEY_ID?.trim()
  const accessKeySecret = process.env.ALIYUN_GREEN_ACCESS_KEY_SECRET?.trim()
  const endpoint = process.env.ALIYUN_GREEN_ENDPOINT?.trim() || DEFAULT_ENDPOINT

  if (!accessKeyId || !accessKeySecret) {
    throw new Error(DEFAULT_SERVICE_ERROR)
  }

  const requestUrl = buildAliyunSignedUrl(
    endpoint,
    accessKeyId,
    accessKeySecret,
    content
  )
  const response = await fetch(requestUrl, {
    method: 'POST',
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(DEFAULT_SERVICE_ERROR)
  }

  const result = (await response.json()) as AliyunAuditResponse
  const riskLevel = result.Data?.RiskLevel

  if (!riskLevel) {
    throw new Error(DEFAULT_SERVICE_ERROR)
  }

  return riskLevel === 'none'
}

export const auditTextContent = async ({
  content,
  scenario,
  identity
}: AuditParams): Promise<string | null> => {
  const text = content.trim()
  if (!text) {
    return null
  }

  const config = await getCommentAuditConfig()
  const keywordBlacklist = splitRules(config.keywordBlacklist)
  const keywordWhitelist = splitRules(config.keywordWhitelist)
  const userBlacklist = splitRules(config.userBlacklist)
  const userWhitelist = splitRules(config.userWhitelist)

  if (matchesUserRule(userWhitelist, identity)) {
    return null
  }

  if (matchesUserRule(userBlacklist, identity)) {
    return '当前账号暂时不能发布这类内容'
  }

  const blockedKeyword = findMatchedKeyword(keywordBlacklist, text)
  if (blockedKeyword) {
    return DEFAULT_AUDIT_ERROR
  }

  if (findMatchedKeyword(keywordWhitelist, text)) {
    return null
  }

  const shouldRunCloudAudit =
    scenario === 'username'
      ? config.enableUsernameAudit
      : config.enableAudit && text.length >= config.minReviewLength

  if (!shouldRunCloudAudit) {
    return null
  }

  let passed = false
  try {
    passed = await auditByAliyun(text)
  } catch (error) {
    return error instanceof Error ? error.message : DEFAULT_SERVICE_ERROR
  }

  if (!passed) {
    return DEFAULT_AUDIT_ERROR
  }

  return null
}
