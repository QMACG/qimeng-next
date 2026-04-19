import { Prisma } from '~/prisma/generated/prisma/client'
import { prisma } from '~/prisma/index'
import type { AdminHomeAnnouncementConfig } from '~/types/api/admin'

const HOME_ANNOUNCEMENT_CONFIG_ID = 1

const DEFAULT_HOME_ANNOUNCEMENT_CONFIG = {
  isEnabled: false,
  title: '站点公告',
  content: ''
} satisfies Omit<AdminHomeAnnouncementConfig, 'updatedAt'>

const mapHomeAnnouncementConfig = (config: {
  is_enabled: boolean
  title: string
  content: string
  updated: Date
}): AdminHomeAnnouncementConfig => ({
  isEnabled: config.is_enabled,
  title: config.title,
  content: config.content,
  updatedAt: config.updated
})

const createDefaultHomeAnnouncementConfig = async () => {
  try {
    return await prisma.site_home_announcement_config.create({
      data: {
        id: HOME_ANNOUNCEMENT_CONFIG_ID,
        is_enabled: DEFAULT_HOME_ANNOUNCEMENT_CONFIG.isEnabled,
        title: DEFAULT_HOME_ANNOUNCEMENT_CONFIG.title,
        content: DEFAULT_HOME_ANNOUNCEMENT_CONFIG.content
      }
    })
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const existing = await prisma.site_home_announcement_config.findUnique({
        where: { id: HOME_ANNOUNCEMENT_CONFIG_ID }
      })

      if (existing) {
        return existing
      }
    }

    throw error
  }
}

export const getHomeAnnouncementConfig =
  async (): Promise<AdminHomeAnnouncementConfig> => {
    const existing = await prisma.site_home_announcement_config.findUnique({
      where: { id: HOME_ANNOUNCEMENT_CONFIG_ID }
    })

    if (existing) {
      return mapHomeAnnouncementConfig(existing)
    }

    const created = await createDefaultHomeAnnouncementConfig()
    return mapHomeAnnouncementConfig(created)
  }
