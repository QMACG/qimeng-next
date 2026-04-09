import { getKv, setKv } from '~/lib/redis'
import type { AdminFrontDisplayConfig } from '~/types/api/admin'
import { DEFAULT_FRONT_DISPLAY_CONFIG } from '~/utils/frontDisplay'

const REDIS_KEY = 'admin:config:front-display'
const CACHE_SECONDS = 365 * 24 * 60 * 60

export const getFrontDisplayConfig = async () => {
  const saved = await getKv(REDIS_KEY)
  if (saved) {
    return JSON.parse(saved) as AdminFrontDisplayConfig
  }

  await setKv(
    REDIS_KEY,
    JSON.stringify(DEFAULT_FRONT_DISPLAY_CONFIG),
    CACHE_SECONDS
  )

  return DEFAULT_FRONT_DISPLAY_CONFIG
}
