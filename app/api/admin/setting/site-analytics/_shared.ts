import { delKv, getKv, setKv } from '~/lib/redis'
import { prisma } from '~/prisma/index'
import type { AdminSiteAnalyticsScript } from '~/types/api/admin'

const CACHE_KEY = 'site:analytics:scripts'
const CACHE_SECONDS = 24 * 60 * 60
const siteAnalyticsScript = (prisma as any).site_analytics_script

const mapSiteAnalyticsScript = (item: any): AdminSiteAnalyticsScript => ({
  id: item.id,
  name: item.name,
  position: item.position as 'head' | 'body_end',
  content: item.content,
  isEnabled: item.is_enabled,
  sortOrder: item.sort_order,
  created: String(item.created),
  updated: String(item.updated)
})

const querySiteAnalyticsScripts = async () => {
  const items = await siteAnalyticsScript.findMany({
    orderBy: [{ sort_order: 'asc' }, { id: 'asc' }]
  })

  return items.map((item: any) => mapSiteAnalyticsScript(item))
}

export const getAdminSiteAnalyticsScripts = async () => {
  return querySiteAnalyticsScripts()
}

export const getPublicSiteAnalyticsScripts = async () => {
  try {
    const cached = await getKv(CACHE_KEY)
    if (cached) {
      return JSON.parse(cached) as AdminSiteAnalyticsScript[]
    }
  } catch {
    // ignore cache read errors
  }

  const items = await siteAnalyticsScript.findMany({
    where: {
      is_enabled: true
    },
    orderBy: [{ sort_order: 'asc' }, { id: 'asc' }]
  })

  const mapped = items.map((item: any) => mapSiteAnalyticsScript(item))

  try {
    await setKv(CACHE_KEY, JSON.stringify(mapped), CACHE_SECONDS)
  } catch {
    // ignore cache write errors
  }

  return mapped
}

export const clearSiteAnalyticsScriptsCache = async () => {
  try {
    await delKv(CACHE_KEY)
  } catch {
    // ignore cache delete errors
  }
}
