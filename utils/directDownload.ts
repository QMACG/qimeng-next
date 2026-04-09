const normalizeHost = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  return trimmed.replace(/\/+$/, '')
}

export const normalizeDirectDownloadFile = (value: string) => {
  const trimmed = value.trim().replace(/\\/g, '/')
  const normalized = trimmed.replace(/^\/+/, '')

  if (!normalized) {
    return null
  }

  if (normalized.includes('..') || /[\r\n\t]/.test(normalized)) {
    return null
  }

  return normalized
}

export const buildDirectDownloadLink = (file: string) =>
  `/getFile?file=${encodeURIComponent(file)}`

export const parseDirectDownloadHosts = (value: string | undefined) =>
  (value ?? '')
    .split(',')
    .map((item) => normalizeHost(item))
    .filter(Boolean)

export const getDirectDownloadEnvStatus = () => {
  const hosts = parseDirectDownloadHosts(process.env.KUN_DIRECT_DOWNLOAD_HOSTS)

  const envReady = Boolean(
    process.env.KUN_DIRECT_DOWNLOAD_ACCOUNT_ID &&
      process.env.KUN_DIRECT_DOWNLOAD_APPLICATION_KEY &&
      process.env.KUN_DIRECT_DOWNLOAD_BUCKET_ID &&
      hosts.length
  )

  return {
    envReady,
    hosts
  }
}
