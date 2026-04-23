const WINDOWS_DRIVE_PATH_REGEXP = /^[a-zA-Z]:[\\/]/
const UNC_PATH_REGEXP = /^\\\\/
const SAFE_REMOTE_HTTP_PROTOCOLS = new Set(['http:', 'https:'])

const isSafeRemoteHttpUrl = (value: string) => {
  try {
    const parsed = new URL(value)
    return SAFE_REMOTE_HTTP_PROTOCOLS.has(parsed.protocol)
  } catch {
    return false
  }
}

export const toSafeRemoteHttpUrl = (
  value?: string | null
): string | undefined => {
  const trimmed = value?.trim()
  if (!trimmed) {
    return undefined
  }

  return isSafeRemoteHttpUrl(trimmed) ? trimmed : undefined
}

export const toSafeAvatarSrc = (value?: string | null): string | undefined => {
  const trimmed = value?.trim()
  if (!trimmed) {
    return undefined
  }

  if (trimmed.startsWith('/')) {
    return trimmed
  }

  return toSafeRemoteHttpUrl(trimmed)
}

export const toSafePublicAssetSrc = (
  value?: string | null
): string | undefined => {
  const trimmed = value?.trim()
  if (!trimmed) {
    return undefined
  }

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed
  }

  if (toSafeRemoteHttpUrl(trimmed)) {
    return trimmed
  }

  if (
    trimmed.startsWith('file:') ||
    WINDOWS_DRIVE_PATH_REGEXP.test(trimmed) ||
    UNC_PATH_REGEXP.test(trimmed)
  ) {
    return undefined
  }

  return undefined
}
