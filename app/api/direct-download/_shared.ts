import { prisma } from '~/prisma/index'
import { delKv, expireKv, getKv, incrKv, setKv } from '~/lib/redis'
import {
  getDirectDownloadEnvStatus,
  normalizeDirectDownloadFile
} from '~/utils/directDownload'
import { canAccessRestrictedContent } from '~/utils/contentVisibility'
import type {
  AdminDirectDownloadConfig,
  AdminDirectDownloadIpBlacklistItem,
  AdminDirectDownloadLogItem,
  AdminDirectDownloadLogResponse,
  AdminDirectDownloadStatisticsResponse,
  AdminDirectDownloadUserBlacklistItem,
  DirectDownloadPreview
} from '~/types/api/direct-download'

interface DirectDownloadAccessContext {
  uid: number
  role: number
  nsfwPreference: string
}

interface PrepareDirectDownloadInput extends DirectDownloadAccessContext {
  file: string
  userIp: string
  userAgent: string
}

const ACCOUNT_TOKEN_KEY = 'direct-download:b2:account-token'
const API_URL_KEY = 'direct-download:b2:api-url'
const DOWNLOAD_TOKEN_KEY = 'direct-download:b2:download-token'

const DEFAULT_DIRECT_DOWNLOAD_CONFIG = {
  enable_download: true,
  require_captcha: true,
  record_logs: true,
  rate_limit_window_minutes: 60,
  rate_limit_max_count: 5
} as const

const getRawDirectDownloadConfig = async () =>
  prisma.site_direct_download_config.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      ...DEFAULT_DIRECT_DOWNLOAD_CONFIG
    }
  })

const mapAdminDirectDownloadConfig =
  async (): Promise<AdminDirectDownloadConfig> => {
    const [config, envStatus] = await Promise.all([
      getRawDirectDownloadConfig(),
      Promise.resolve(getDirectDownloadEnvStatus())
    ])

    return {
      enableDownload: config.enable_download,
      requireCaptcha: config.require_captcha,
      recordLogs: config.record_logs,
      rateLimitWindowMinutes: config.rate_limit_window_minutes,
      rateLimitMaxCount: config.rate_limit_max_count,
      envReady: envStatus.envReady,
      downloadHostsCount: envStatus.hosts.length
    }
  }

const buildResourceCandidates = (file: string) => {
  const rawLink = `/getFile?file=${file}`
  const encodedLink = `/getFile?file=${encodeURIComponent(file)}`

  return Array.from(new Set([rawLink, encodedLink]))
}

const findDirectResource = async (file: string) => {
  const candidates = buildResourceCandidates(file)

  return prisma.patch_resource.findFirst({
    where: {
      section: 'direct',
      status: 0,
      OR: candidates.map((content) => ({ content }))
    },
    include: {
      patch: {
        select: {
          id: true,
          unique_id: true,
          name: true,
          visibility: true,
          content_limit: true,
          user_id: true
        }
      }
    }
  })
}

const canAccessDirectResource = (
  resource: Awaited<ReturnType<typeof findDirectResource>>,
  context: DirectDownloadAccessContext
) => {
  if (!resource) {
    return {
      ok: false,
      message: '当前直链资源不存在或已下线。'
    }
  }

  const canAccessVisibility = canAccessRestrictedContent({
    visibility: resource.patch.visibility,
    authorId: resource.patch.user_id,
    uid: context.uid,
    role: context.role
  })
  if (!canAccessVisibility) {
    return {
      ok: false,
      message: '当前资源暂不可用。'
    }
  }

  const nsfwBlocked =
    resource.patch.content_limit === 'nsfw' &&
    context.role < 2 &&
    context.nsfwPreference === 'sfw'

  if (nsfwBlocked) {
    return {
      ok: false,
      message: '当前资源未在你的显示范围内，请调整设置后再试。'
    }
  }

  return {
    ok: true,
    message: ''
  }
}

const createDirectDownloadLog = async (input: {
  recordLogs: boolean
  userId: number
  userIp: string
  userAgent: string
  filePath: string
  status: string
  reason: string
  patchId?: number | null
  resourceId?: number | null
}) => {
  if (!input.recordLogs) {
    return
  }

  await prisma.site_direct_download_log.create({
    data: {
      user_id: input.userId,
      user_ip: input.userIp,
      user_agent: input.userAgent,
      file_path: input.filePath,
      status: input.status,
      reason: input.reason,
      patch_id: input.patchId ?? null,
      resource_id: input.resourceId ?? null
    }
  })
}

const consumeRateLimit = async (
  userId: number,
  filePath: string,
  windowMinutes: number,
  maxCount: number
) => {
  if (windowMinutes <= 0 || maxCount <= 0) {
    return {
      ok: true,
      message: ''
    }
  }

  const windowSeconds = windowMinutes * 60
  const fileKey = Buffer.from(filePath).toString('base64url')
  const userKey = `direct-download:limit:user:${userId}:file:${fileKey}`

  const userCountRaw = await getKv(userKey)
  const userCount = Number(userCountRaw ?? '0')

  if (userCount >= maxCount) {
    return {
      ok: false,
      message: `${windowMinutes} 分钟内同一直链文件最多可下载 ${maxCount} 次，请稍后再试。`
    }
  }

  const nextUserCount = await incrKv(userKey)

  if (nextUserCount === 1) {
    await expireKv(userKey, windowSeconds)
  }

  return {
    ok: true,
    message: ''
  }
}

const getB2AccountAuthorization = async () => {
  const cachedToken = await getKv(ACCOUNT_TOKEN_KEY)
  const cachedApiUrl = await getKv(API_URL_KEY)
  if (cachedToken && cachedApiUrl) {
    return {
      authorizationToken: cachedToken,
      apiUrl: cachedApiUrl
    }
  }

  const accountId = process.env.KUN_DIRECT_DOWNLOAD_ACCOUNT_ID
  const applicationKey = process.env.KUN_DIRECT_DOWNLOAD_APPLICATION_KEY
  if (!accountId || !applicationKey) {
    throw new Error('直链下载环境变量未配置完整。')
  }

  const basicToken = Buffer.from(`${accountId}:${applicationKey}`).toString(
    'base64'
  )
  const response = await fetch(
    'https://api.backblazeb2.com/b2api/v3/b2_authorize_account',
    {
      method: 'GET',
      headers: {
        Authorization: `Basic ${basicToken}`
      },
      cache: 'no-store'
    }
  )

  const data = (await response.json()) as {
    authorizationToken?: string
    apiInfo?: { storageApi?: { apiUrl?: string } }
  }

  if (
    !response.ok ||
    !data.authorizationToken ||
    !data.apiInfo?.storageApi?.apiUrl
  ) {
    throw new Error('获取直链下载授权失败。')
  }

  await Promise.all([
    setKv(ACCOUNT_TOKEN_KEY, data.authorizationToken, 23 * 60 * 60),
    setKv(API_URL_KEY, data.apiInfo.storageApi.apiUrl, 23 * 60 * 60)
  ])

  return {
    authorizationToken: data.authorizationToken,
    apiUrl: data.apiInfo.storageApi.apiUrl
  }
}

const getB2DownloadAuthorization = async () => {
  const cachedToken = await getKv(DOWNLOAD_TOKEN_KEY)
  if (cachedToken) {
    return cachedToken
  }

  const bucketId = process.env.KUN_DIRECT_DOWNLOAD_BUCKET_ID
  if (!bucketId) {
    throw new Error('直链下载存储桶未配置。')
  }

  const { authorizationToken, apiUrl } = await getB2AccountAuthorization()
  const response = await fetch(
    `${apiUrl}/b2api/v3/b2_get_download_authorization`,
    {
      method: 'POST',
      headers: {
        Authorization: authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bucketId,
        fileNamePrefix: '',
        validDurationInSeconds: 7200
      }),
      cache: 'no-store'
    }
  )

  const data = (await response.json()) as { authorizationToken?: string }
  if (!response.ok || !data.authorizationToken) {
    await Promise.all([
      delKv(ACCOUNT_TOKEN_KEY),
      delKv(API_URL_KEY),
      delKv(DOWNLOAD_TOKEN_KEY)
    ])
    throw new Error('获取直链下载令牌失败，请稍后重试。')
  }

  await setKv(DOWNLOAD_TOKEN_KEY, data.authorizationToken, 5400)
  return data.authorizationToken
}

const buildB2DownloadUrl = async (file: string) => {
  const envStatus = getDirectDownloadEnvStatus()
  if (!envStatus.envReady || envStatus.hosts.length === 0) {
    throw new Error('直链下载线路尚未配置完成。')
  }

  const token = await getB2DownloadAuthorization()
  const host =
    envStatus.hosts[Math.floor(Math.random() * envStatus.hosts.length)]!
  const encodedPath = file
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  return `${host}/${encodedPath}?Authorization=${encodeURIComponent(token)}`
}

export const createDirectDownloadPreview = async (
  fileInput: string,
  context: DirectDownloadAccessContext
): Promise<DirectDownloadPreview> => {
  const config = await getRawDirectDownloadConfig()
  const envStatus = getDirectDownloadEnvStatus()
  const normalizedFile = normalizeDirectDownloadFile(fileInput)

  if (!normalizedFile) {
    return {
      file: '',
      isLoggedIn: context.uid > 0,
      canDownload: false,
      requiresCaptcha: config.require_captcha,
      rateLimitWindowMinutes: config.rate_limit_window_minutes,
      rateLimitMaxCount: config.rate_limit_max_count,
      message: '直链地址无效，请返回资源页重新进入。',
      patch: null,
      resource: null
    }
  }

  const resource = await findDirectResource(normalizedFile)
  const access = canAccessDirectResource(resource, context)

  if (!resource) {
    return {
      file: normalizedFile,
      isLoggedIn: context.uid > 0,
      canDownload: false,
      requiresCaptcha: config.require_captcha,
      rateLimitWindowMinutes: config.rate_limit_window_minutes,
      rateLimitMaxCount: config.rate_limit_max_count,
      message: access.message,
      patch: null,
      resource: null
    }
  }

  const patch = {
    id: resource.patch.id,
    uniqueId: resource.patch.unique_id,
    name: resource.patch.name
  }

  const resourceInfo = {
    id: resource.id,
    name: resource.name
  }

  if (context.uid <= 0) {
    return {
      file: normalizedFile,
      isLoggedIn: false,
      canDownload: false,
      requiresCaptcha: config.require_captcha,
      rateLimitWindowMinutes: config.rate_limit_window_minutes,
      rateLimitMaxCount: config.rate_limit_max_count,
      message: '直链资源需要登录后才能下载。',
      patch,
      resource: resourceInfo
    }
  }

  if (!config.enable_download) {
    return {
      file: normalizedFile,
      isLoggedIn: true,
      canDownload: false,
      requiresCaptcha: config.require_captcha,
      rateLimitWindowMinutes: config.rate_limit_window_minutes,
      rateLimitMaxCount: config.rate_limit_max_count,
      message: '直链下载暂时关闭，请稍后再试。',
      patch,
      resource: resourceInfo
    }
  }

  if (!envStatus.envReady) {
    return {
      file: normalizedFile,
      isLoggedIn: true,
      canDownload: false,
      requiresCaptcha: config.require_captcha,
      rateLimitWindowMinutes: config.rate_limit_window_minutes,
      rateLimitMaxCount: config.rate_limit_max_count,
      message: '直链下载线路尚未配置完成，请稍后再试。',
      patch,
      resource: resourceInfo
    }
  }

  if (!access.ok) {
    return {
      file: normalizedFile,
      isLoggedIn: true,
      canDownload: false,
      requiresCaptcha: config.require_captcha,
      rateLimitWindowMinutes: config.rate_limit_window_minutes,
      rateLimitMaxCount: config.rate_limit_max_count,
      message: access.message,
      patch,
      resource: resourceInfo
    }
  }

  return {
    file: normalizedFile,
    isLoggedIn: true,
    canDownload: true,
    requiresCaptcha: config.require_captcha,
    rateLimitWindowMinutes: config.rate_limit_window_minutes,
    rateLimitMaxCount: config.rate_limit_max_count,
    message: '验证通过后即可进入直链下载。',
    patch,
    resource: resourceInfo
  }
}

export const prepareDirectDownload = async (
  input: PrepareDirectDownloadInput
) => {
  const config = await getRawDirectDownloadConfig()
  const normalizedFile = normalizeDirectDownloadFile(input.file)

  if (!normalizedFile) {
    throw new Error('直链地址无效，请返回资源页重新进入。')
  }

  if (input.uid <= 0) {
    throw new Error('请先登录后再下载直链资源。')
  }

  if (!config.enable_download) {
    throw new Error('直链下载暂时关闭，请稍后再试。')
  }

  const resource = await findDirectResource(normalizedFile)
  const access = canAccessDirectResource(resource, input)

  if (!resource || !access.ok) {
    await createDirectDownloadLog({
      recordLogs: config.record_logs,
      userId: input.uid,
      userIp: input.userIp,
      userAgent: input.userAgent,
      filePath: normalizedFile,
      status: 'blocked',
      reason: access.message || '当前资源不存在',
      patchId: resource?.patch.id,
      resourceId: resource?.id
    })
    throw new Error(access.message || '当前资源暂不可用。')
  }

  const [ipBlocked, userBlocked] = await Promise.all([
    prisma.site_direct_download_ip_blacklist.findUnique({
      where: { ip: input.userIp || '__empty__' }
    }),
    prisma.site_direct_download_user_blacklist.findUnique({
      where: { user_id: input.uid }
    })
  ])

  if (ipBlocked) {
    await createDirectDownloadLog({
      recordLogs: config.record_logs,
      userId: input.uid,
      userIp: input.userIp,
      userAgent: input.userAgent,
      filePath: normalizedFile,
      status: 'blocked',
      reason: '当前 IP 已被禁止下载直链资源。',
      patchId: resource.patch.id,
      resourceId: resource.id
    })
    throw new Error('当前网络环境暂时无法下载直链资源。')
  }

  if (userBlocked) {
    await createDirectDownloadLog({
      recordLogs: config.record_logs,
      userId: input.uid,
      userIp: input.userIp,
      userAgent: input.userAgent,
      filePath: normalizedFile,
      status: 'blocked',
      reason: '当前账号已被禁止下载直链资源。',
      patchId: resource.patch.id,
      resourceId: resource.id
    })
    throw new Error('当前账号暂时无法下载直链资源。')
  }

  const rateLimit = await consumeRateLimit(
    input.uid,
    normalizedFile,
    config.rate_limit_window_minutes,
    config.rate_limit_max_count
  )

  if (!rateLimit.ok) {
    await createDirectDownloadLog({
      recordLogs: config.record_logs,
      userId: input.uid,
      userIp: input.userIp,
      userAgent: input.userAgent,
      filePath: normalizedFile,
      status: 'blocked',
      reason: rateLimit.message,
      patchId: resource.patch.id,
      resourceId: resource.id
    })
    throw new Error(rateLimit.message)
  }

  const downloadUrl = await buildB2DownloadUrl(normalizedFile)

  await prisma.$transaction([
    prisma.patch.update({
      where: { id: resource.patch.id },
      data: { download: { increment: 1 } }
    }),
    prisma.patch_resource.update({
      where: { id: resource.id },
      data: { download: { increment: 1 } }
    })
  ])

  await createDirectDownloadLog({
    recordLogs: config.record_logs,
    userId: input.uid,
    userIp: input.userIp,
    userAgent: input.userAgent,
    filePath: normalizedFile,
    status: 'success',
    reason: '',
    patchId: resource.patch.id,
    resourceId: resource.id
  })

  return {
    downloadUrl
  }
}

export const getAdminDirectDownloadConfig = mapAdminDirectDownloadConfig

export const getAdminDirectDownloadLogs = async (input: {
  page: number
  limit: number
  search?: string
  patchKeyword?: string
  userKeyword?: string
  status?: string
}): Promise<AdminDirectDownloadLogResponse> => {
  const page = Math.max(1, input.page)
  const limit = Math.min(100, Math.max(1, input.limit))
  const skip = (page - 1) * limit

  const andWhere: Record<string, unknown>[] = []
  const search = input.search?.trim()
  const patchKeyword = input.patchKeyword?.trim()
  const userKeyword = input.userKeyword?.trim()

  if (search) {
    andWhere.push({
      OR: [
        { file_path: { contains: search } },
        { user_ip: { contains: search } },
        { reason: { contains: search } },
        { user: { is: { name: { contains: search } } } },
        { user: { is: { email: { contains: search } } } },
        { patch: { is: { name: { contains: search } } } }
      ]
    })
  }

  if (patchKeyword) {
    const patchId = Number.parseInt(patchKeyword, 10)
    andWhere.push(
      Number.isNaN(patchId)
        ? {
            patch: {
              is: {
                name: { contains: patchKeyword }
              }
            }
          }
        : {
            OR: [
              { patch_id: patchId },
              {
                patch: {
                  is: {
                    name: { contains: patchKeyword }
                  }
                }
              }
            ]
          }
    )
  }

  if (userKeyword) {
    const userId = Number.parseInt(userKeyword, 10)
    andWhere.push(
      Number.isNaN(userId)
        ? {
            OR: [
              { user: { is: { name: { contains: userKeyword } } } },
              { user: { is: { email: { contains: userKeyword } } } }
            ]
          }
        : {
            OR: [
              { user_id: userId },
              { user: { is: { name: { contains: userKeyword } } } },
              { user: { is: { email: { contains: userKeyword } } } }
            ]
          }
    )
  }

  if (input.status && input.status !== 'all') {
    andWhere.push({ status: input.status })
  }

  const where = andWhere.length ? { AND: andWhere } : {}

  const [items, total, grouped] = await Promise.all([
    prisma.site_direct_download_log.findMany({
      where,
      orderBy: { created: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        patch: {
          select: {
            id: true,
            unique_id: true,
            name: true
          }
        },
        resource: {
          select: {
            id: true,
            name: true
          }
        }
      }
    }),
    prisma.site_direct_download_log.count({ where }),
    prisma.site_direct_download_log.groupBy({
      by: ['status'],
      where,
      _count: {
        _all: true
      }
    })
  ])

  const summary = grouped.reduce(
    (acc, item) => {
      const count = item._count._all
      if (item.status === 'success') {
        acc.success += count
      } else {
        acc.blocked += count
      }
      return acc
    },
    {
      total,
      success: 0,
      blocked: 0
    }
  )

  return {
    items: items.map<AdminDirectDownloadLogItem>((item) => ({
      id: item.id,
      filePath: item.file_path,
      userIp: item.user_ip,
      userAgent: item.user_agent,
      status: item.status,
      reason: item.reason,
      created: String(item.created),
      user: item.user,
      patch: item.patch
        ? {
            id: item.patch.id,
            uniqueId: item.patch.unique_id,
            name: item.patch.name
          }
        : null,
      resource: item.resource
    })),
    total,
    summary
  }
}

export const getAdminDirectDownloadStatistics =
  async (): Promise<AdminDirectDownloadStatisticsResponse> => {
    const now = Date.now()
    const last24Hours = new Date(now - 24 * 60 * 60 * 1000)
    const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000)

    const [
      totalRequests,
      groupedStatus,
      recent24Hours,
      recent7Days,
      uniqueUsers,
      uniquePatches,
      uniqueIps,
      patchGroups,
      userGroups,
      ipGroups,
      reasonGroups
    ] = await Promise.all([
      prisma.site_direct_download_log.count(),
      prisma.site_direct_download_log.groupBy({
        by: ['status'],
        _count: { _all: true }
      }),
      prisma.site_direct_download_log.count({
        where: { created: { gte: last24Hours } }
      }),
      prisma.site_direct_download_log.count({
        where: { created: { gte: last7Days } }
      }),
      prisma.site_direct_download_log.groupBy({
        by: ['user_id'],
        where: { user_id: { not: null } }
      }),
      prisma.site_direct_download_log.groupBy({
        by: ['patch_id'],
        where: { patch_id: { not: null } }
      }),
      prisma.site_direct_download_log.groupBy({
        by: ['user_ip'],
        where: { user_ip: { not: '' } }
      }),
      prisma.site_direct_download_log.groupBy({
        by: ['patch_id', 'status'],
        where: { patch_id: { not: null } },
        _count: { _all: true }
      }),
      prisma.site_direct_download_log.groupBy({
        by: ['user_id', 'status'],
        where: { user_id: { not: null } },
        _count: { _all: true }
      }),
      prisma.site_direct_download_log.groupBy({
        by: ['user_ip', 'status'],
        where: { user_ip: { not: '' } },
        _count: { _all: true }
      }),
      prisma.site_direct_download_log.groupBy({
        by: ['reason'],
        where: {
          status: 'blocked',
          reason: {
            not: ''
          }
        },
        _count: { _all: true }
      })
    ])

    let successRequests = 0
    let blockedRequests = 0
    for (const item of groupedStatus) {
      if (item.status === 'success') {
        successRequests += item._count._all
      } else {
        blockedRequests += item._count._all
      }
    }

    const patchStatsMap = new Map<
      number,
      {
        patchId: number
        total: number
        success: number
        blocked: number
      }
    >()

    for (const item of patchGroups) {
      if (item.patch_id == null) {
        continue
      }

      const current = patchStatsMap.get(item.patch_id) ?? {
        patchId: item.patch_id,
        total: 0,
        success: 0,
        blocked: 0
      }

      current.total += item._count._all
      if (item.status === 'success') {
        current.success += item._count._all
      } else {
        current.blocked += item._count._all
      }

      patchStatsMap.set(item.patch_id, current)
    }

    const userStatsMap = new Map<
      number,
      {
        userId: number
        total: number
        success: number
        blocked: number
      }
    >()

    for (const item of userGroups) {
      if (item.user_id == null) {
        continue
      }

      const current = userStatsMap.get(item.user_id) ?? {
        userId: item.user_id,
        total: 0,
        success: 0,
        blocked: 0
      }

      current.total += item._count._all
      if (item.status === 'success') {
        current.success += item._count._all
      } else {
        current.blocked += item._count._all
      }

      userStatsMap.set(item.user_id, current)
    }

    const ipStatsMap = new Map<
      string,
      {
        userIp: string
        total: number
        success: number
        blocked: number
      }
    >()

    for (const item of ipGroups) {
      if (!item.user_ip) {
        continue
      }

      const current = ipStatsMap.get(item.user_ip) ?? {
        userIp: item.user_ip,
        total: 0,
        success: 0,
        blocked: 0
      }

      current.total += item._count._all
      if (item.status === 'success') {
        current.success += item._count._all
      } else {
        current.blocked += item._count._all
      }

      ipStatsMap.set(item.user_ip, current)
    }

    const topPatchIds = [...patchStatsMap.values()]
      .sort(
        (left, right) =>
          right.total - left.total || right.success - left.success
      )
      .slice(0, 10)
      .map((item) => item.patchId)

    const topUserIds = [...userStatsMap.values()]
      .sort(
        (left, right) =>
          right.total - left.total || right.success - left.success
      )
      .slice(0, 10)
      .map((item) => item.userId)

    const [patches, users] = await Promise.all([
      topPatchIds.length
        ? prisma.patch.findMany({
            where: {
              id: {
                in: topPatchIds
              }
            },
            select: {
              id: true,
              unique_id: true,
              name: true
            }
          })
        : Promise.resolve([]),
      topUserIds.length
        ? prisma.user.findMany({
            where: {
              id: {
                in: topUserIds
              }
            },
            select: {
              id: true,
              name: true,
              email: true
            }
          })
        : Promise.resolve([])
    ])

    const patchMap = new Map(patches.map((item) => [item.id, item] as const))
    const userMap = new Map(users.map((item) => [item.id, item] as const))

    const topPatches = [...patchStatsMap.values()]
      .sort(
        (left, right) =>
          right.total - left.total || right.success - left.success
      )
      .slice(0, 10)
      .map((item) => {
        const patch = patchMap.get(item.patchId)
        return patch
          ? {
              patchId: item.patchId,
              uniqueId: patch.unique_id,
              name: patch.name,
              total: item.total,
              success: item.success,
              blocked: item.blocked
            }
          : null
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))

    const topUsers = [...userStatsMap.values()]
      .sort(
        (left, right) =>
          right.total - left.total || right.success - left.success
      )
      .slice(0, 10)
      .map((item) => {
        const user = userMap.get(item.userId)
        return user
          ? {
              userId: item.userId,
              name: user.name,
              email: user.email,
              total: item.total,
              success: item.success,
              blocked: item.blocked
            }
          : null
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))

    const topIps = [...ipStatsMap.values()]
      .sort(
        (left, right) =>
          right.total - left.total || right.success - left.success
      )
      .slice(0, 10)

    const blockedReasons = reasonGroups
      .map((item) => ({
        reason: item.reason,
        count: item._count._all
      }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 10)

    return {
      overview: {
        totalRequests,
        successRequests,
        blockedRequests,
        recent24Hours,
        recent7Days,
        uniqueUsers: uniqueUsers.length,
        uniquePatches: uniquePatches.length,
        uniqueIps: uniqueIps.length
      },
      topPatches,
      topUsers,
      topIps,
      blockedReasons
    }
  }

export const getAdminDirectDownloadIpBlacklist = async (): Promise<
  AdminDirectDownloadIpBlacklistItem[]
> => {
  const items = await prisma.site_direct_download_ip_blacklist.findMany({
    orderBy: [{ updated: 'desc' }, { id: 'desc' }]
  })

  return items.map((item) => ({
    id: item.id,
    ip: item.ip,
    reason: item.reason,
    created: String(item.created),
    updated: String(item.updated)
  }))
}

export const getAdminDirectDownloadUserBlacklist = async (): Promise<
  AdminDirectDownloadUserBlacklistItem[]
> => {
  const items = await prisma.site_direct_download_user_blacklist.findMany({
    orderBy: [{ updated: 'desc' }, { id: 'desc' }],
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })

  return items.map((item) => ({
    id: item.id,
    reason: item.reason,
    created: String(item.created),
    updated: String(item.updated),
    user: item.user
  }))
}

export { findDirectResource, getRawDirectDownloadConfig }
