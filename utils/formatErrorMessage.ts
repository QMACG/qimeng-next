import { ZodError, type ZodIssue } from 'zod'

const FALLBACK_BAD_REQUEST = '请求参数不正确'
const FALLBACK_UNKNOWN_ERROR = '发生未知错误'

const normalizeMessage = (message: string) => {
  const trimmed = message.trim()

  if (!trimmed) {
    return FALLBACK_BAD_REQUEST
  }

  if (/^required$/i.test(trimmed)) {
    return '请完整填写必填项'
  }

  if (/invalid url/i.test(trimmed)) {
    return '请输入有效的链接地址'
  }

  if (/^\[object object\]$/i.test(trimmed)) {
    return FALLBACK_UNKNOWN_ERROR
  }

  return trimmed
}

const formatIssueMessage = (issue: ZodIssue) => {
  const normalized = normalizeMessage(issue.message)
  if (normalized && normalized !== 'Invalid input') {
    return normalized
  }

  switch (issue.code) {
    case 'invalid_type':
      return issue.received === 'undefined'
        ? '请完整填写必填项'
        : '输入格式不正确'
    case 'invalid_string':
      if (issue.validation === 'url') {
        return '请输入有效的链接地址'
      }
      if (issue.validation === 'email') {
        return '请输入有效的邮箱地址'
      }
      return '输入格式不正确'
    case 'invalid_enum_value':
      return '所选内容不合法'
    case 'too_small':
      if (issue.type === 'string') {
        return issue.minimum === 1
          ? '请完整填写必填项'
          : `内容至少需要 ${issue.minimum} 个字符`
      }
      if (issue.type === 'number') {
        return `数值不能小于 ${issue.minimum}`
      }
      if (issue.type === 'array') {
        return `至少需要 ${issue.minimum} 项`
      }
      return FALLBACK_BAD_REQUEST
    case 'too_big':
      if (issue.type === 'string') {
        return `内容不能超过 ${issue.maximum} 个字符`
      }
      if (issue.type === 'number') {
        return `数值不能大于 ${issue.maximum}`
      }
      if (issue.type === 'array') {
        return `最多只能填写 ${issue.maximum} 项`
      }
      return FALLBACK_BAD_REQUEST
    case 'custom':
      return normalized || FALLBACK_BAD_REQUEST
    default:
      return FALLBACK_BAD_REQUEST
  }
}

export const formatZodError = (error: ZodError) => {
  const messages = error.issues
    .map((issue) => formatIssueMessage(issue))
    .filter(Boolean)

  return Array.from(new Set(messages)).join('\n') || FALLBACK_BAD_REQUEST
}

export const formatUnknownErrorMessage = (value: unknown): string => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return FALLBACK_UNKNOWN_ERROR
    }

    try {
      const parsed = JSON.parse(trimmed)
      return formatUnknownErrorMessage(parsed)
    } catch {
      return normalizeMessage(trimmed)
    }
  }

  if (value instanceof Error) {
    return normalizeMessage(value.message || FALLBACK_UNKNOWN_ERROR)
  }

  if (Array.isArray(value)) {
    const messages = value
      .map((item) => formatUnknownErrorMessage(item))
      .filter(Boolean)

    return Array.from(new Set(messages)).join('\n') || FALLBACK_UNKNOWN_ERROR
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>

    if (typeof record.code === 'string') {
      return formatIssueMessage(record as unknown as ZodIssue)
    }

    if (typeof record.message === 'string') {
      return normalizeMessage(record.message)
    }

    if (Array.isArray(record.errors)) {
      return formatUnknownErrorMessage(record.errors)
    }

    if (Array.isArray(record.issues)) {
      return formatUnknownErrorMessage(record.issues)
    }
  }

  return FALLBACK_UNKNOWN_ERROR
}
