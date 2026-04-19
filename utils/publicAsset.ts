const WINDOWS_DRIVE_PATH_REGEXP = /^[a-zA-Z]:[\\/]/
const UNC_PATH_REGEXP = /^\\\\/

export const toSafePublicAssetSrc = (
  value?: string | null
): string | undefined => {
  const trimmed = value?.trim()
  if (!trimmed) {
    return undefined
  }

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:')
  ) {
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
