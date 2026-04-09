const ensureAbsoluteHttpUrl = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export const normalizeFriendLinkUrl = (value: string) =>
  ensureAbsoluteHttpUrl(value).replace(/\/+$/, '')

export const resolveFriendLinkAvatar = (link: string, avatar?: string) => {
  const customAvatar = avatar?.trim() ?? ''
  if (customAvatar) {
    return customAvatar
  }

  try {
    const url = new URL(normalizeFriendLinkUrl(link))
    return `${url.origin}/favicon.ico`
  } catch {
    return '/favicon.ico'
  }
}
